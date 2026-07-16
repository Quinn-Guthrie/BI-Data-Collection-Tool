import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if entry exists and user has permission
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Only admin or the entry owner can edit
    if (
      session.user.role !== 'admin' &&
      existingEntry.accountManagerUserId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      plantId,
      companyId,
      countryId,
      region,
      subregion,
      existingCustomer,
      goToMarket,
      distributorId,
      productionBeerHlYear,
      segmentId,
      productionPercent,
      confidencePercent,
      comments,
      status,
      finalized,
      enzymeValues,
    } = body

    // Validation errors array
    const errors: string[] = []

    // Validation for finalized entries
    if (finalized) {
      if (!companyId) errors.push('Company is required')
      if (!countryId) errors.push('Country is required')
      if (!region) errors.push('Region is required')
      if (!subregion) errors.push('Subregion is required')
      if (!segmentId) errors.push('Segment is required')
      if (!existingCustomer) errors.push('Existing customer status is required')
      if (!goToMarket) errors.push('Go-to-market method is required')

      if (goToMarket === 'distributor' && !distributorId) {
        errors.push('Distributor is required when go-to-market is distributor')
      }

      if (
        productionBeerHlYear === null ||
        productionBeerHlYear === undefined
      ) {
        errors.push('Production (HL/year) is required')
      }

      if (productionPercent === null || productionPercent === undefined) {
        errors.push('Production percentage is required')
      }

      if (confidencePercent === null || confidencePercent === undefined) {
        errors.push('Confidence percentage is required')
      }

      // Validate enzyme values
      if (enzymeValues && Object.keys(enzymeValues).length > 0) {
        Object.entries(enzymeValues).forEach(([enzymeId, value]: [string, any]) => {
          if (value.penetrationPercent && value.penetrationPercent > 0) {
            const total =
              (value.iffMarketSharePercent || 0) +
              (value.novonesisMarketSharePercent || 0) +
              (value.dsmMarketSharePercent || 0) +
              (value.othersMarketSharePercent || 0)

            if (Math.abs(total - 100) > 0.01) {
              errors.push(
                `Market share for enzyme must total 100% (currently ${total}%)`
              )
            }
          }
        })
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    // Update the entry
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        plantId: plantId || null,
        companyId,
        countryId,
        region,
        subregion,
        existingCustomer,
        goToMarket,
        distributorId: distributorId || null,
        productionBeerHlYear: productionBeerHlYear || null,
        segmentId,
        productionPercent: productionPercent || null,
        confidencePercent: confidencePercent || null,
        comments: comments || null,
        status: status || 'draft',
        finalized: finalized || false,
        finalizedAt: finalized ? new Date() : null,
        rejectionReason: null, // Clear rejection reason when editing
        approvalStatus: 'pending', // Reset approval status when edited
      },
    })

    // Delete existing enzyme values and create new ones
    await prisma.entryEnzymeValue.deleteMany({
      where: { entryId: id },
    })

    if (enzymeValues && Object.keys(enzymeValues).length > 0) {
      const enzymeValuesData = Object.entries(enzymeValues).map(
        ([enzymeId, value]: [string, any]) => ({
          entryId: id,
          enzymeCategoryId: enzymeId,
          usageStatus: value.usageStatus || 'unknown',
          penetrationPercent: value.penetrationPercent || null,
          iffMarketSharePercent: value.iffMarketSharePercent || null,
          novonesisMarketSharePercent: value.novonesisMarketSharePercent || null,
          dsmMarketSharePercent: value.dsmMarketSharePercent || null,
          othersMarketSharePercent: value.othersMarketSharePercent || null,
          confirmed: value.confirmed || false,
        })
      )

      await prisma.entryEnzymeValue.createMany({
        data: enzymeValuesData,
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Entry',
        entityId: id,
        action: finalized ? 'finalized' : 'updated',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          status,
          finalized,
          companyId,
          countryId,
          segmentId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    })
  } catch (error: any) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Failed to update entry', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        company: true,
        country: true,
        plant: true,
        segment: true,
        distributor: true,
        cycle: true,
        accountManager: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        enzymeValues: {
          include: {
            enzymeCategory: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Check permissions
    if (
      session.user.role !== 'admin' &&
      session.user.role !== 'approver' &&
      entry.accountManagerUserId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Error fetching entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entry', details: error.message },
      { status: 500 }
    )
  }
}
