import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Entry submission received:', {
      companyId: body.companyId,
      countryId: body.countryId,
      segmentId: body.segmentId,
      plantId: body.plantId,
      status: body.status,
      finalized: body.finalized,
    })

    const {
      cycleId,
      businessSegmentId,
      plantId,
      companyId,
      countryId,
      region,
      subregion,
      existingCustomer,
      goToMarket,
      distributorName,
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

    // These fields are always required (database constraints)
    if (!cycleId) errors.push('Cycle is required')
    if (!businessSegmentId) errors.push('Business segment is required')
    if (!companyId) errors.push('Company is required')
    if (!countryId) errors.push('Country is required')
    if (!region) errors.push('Region is required')
    if (!subregion) errors.push('Subregion is required')
    if (!existingCustomer) errors.push('Existing customer status is required')
    if (!goToMarket) errors.push('Go-to-market strategy is required')
    if (!segmentId) errors.push('Segment is required')

    // Additional validation for finalized entries
    if (finalized) {
      if (goToMarket === 'distributor' && !distributorName) {
        errors.push('Distributor name is required when using distributor channel')
      }
      if (confidencePercent === null || confidencePercent === undefined) {
        errors.push('Confidence percentage is required for finalized entries')
      }

      // Validate enzyme market shares
      if (enzymeValues) {
        // Get all enzyme categories for validation messages
        const allEnzymes = await prisma.enzymeCategory.findMany({
          select: { id: true, name: true },
        })
        const enzymeMap = new Map(allEnzymes.map(e => [e.id, e.name]))

        for (const enzymeId of Object.keys(enzymeValues)) {
          const ev = enzymeValues[enzymeId]
          if (ev.penetrationPercent > 0) {
            const total =
              (ev.iffMarketSharePercent || 0) +
              (ev.novonesisMarketSharePercent || 0) +
              (ev.dsmMarketSharePercent || 0) +
              (ev.othersMarketSharePercent || 0)

            if (Math.abs(total - 100) > 0.1) {
              const enzymeName = enzymeMap.get(enzymeId) || 'Enzyme'
              errors.push(
                `${enzymeName} market share must total 100% (currently ${total.toFixed(1)}%)`
              )
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    // Verify business segment exists
    const businessSegment = await prisma.businessSegment.findUnique({
      where: { id: businessSegmentId }
    })

    if (!businessSegment) {
      return NextResponse.json(
        { error: 'Business segment not found' },
        { status: 404 }
      )
    }

    // Check for duplicate
    const existing = await prisma.entry.findFirst({
      where: {
        businessSegmentId,
        cycleId,
        companyId,
        countryId,
        segmentId,
        plantId: plantId || null,
      },
      include: {
        company: { select: { name: true } },
        country: { select: { countryName: true } },
        segment: { select: { name: true } },
        plant: { select: { name: true } },
      },
    })

    if (existing) {
      const plantInfo = existing.plant ? ` | Plant: ${existing.plant.name}` : ''
      return NextResponse.json(
        {
          error: `Entry already exists: ${existing.company.name} | ${existing.country.countryName} | ${existing.segment.name}${plantInfo}. Please choose a different combination or edit the existing entry from the dashboard.`
        },
        { status: 409 }
      )
    }

    // Create entry
    const entry = await prisma.entry.create({
      data: {
        businessSegmentId, // Use provided business segment
        cycleId,
        accountManagerUserId: session.user.id,
        plantId: plantId || null,
        companyId,
        countryId,
        region,
        subregion,
        existingCustomer,
        goToMarket,
        distributorId: null,
        productionBeerHlYear,
        segmentId,
        productionPercent,
        confidencePercent,
        comments,
        status: status || 'draft',
        finalized: finalized || false,
        approvalStatus: finalized ? 'pending' : 'pending',
        finalizedAt: finalized ? new Date() : null,
      },
    })

    // Create enzyme values
    if (enzymeValues) {
      const enzymeRecords = Object.keys(enzymeValues).map((enzymeId) => ({
        entryId: entry.id,
        enzymeCategoryId: enzymeId,
        usageStatus: enzymeValues[enzymeId].usageStatus || 'unknown',
        penetrationPercent: enzymeValues[enzymeId].penetrationPercent || null,
        iffMarketSharePercent: enzymeValues[enzymeId].iffMarketSharePercent || null,
        novonesisMarketSharePercent:
          enzymeValues[enzymeId].novonesisMarketSharePercent || null,
        dsmMarketSharePercent: enzymeValues[enzymeId].dsmMarketSharePercent || null,
        othersMarketSharePercent: enzymeValues[enzymeId].othersMarketSharePercent || null,
        confirmed: true,
      }))

      await prisma.entryEnzymeValue.createMany({
        data: enzymeRecords,
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Entry',
        entityId: entry.id,
        action: finalized ? 'finalized' : 'created',
        changedBy: session.user.id,
        newValue: JSON.stringify({ status, finalized }),
      },
    })

    return NextResponse.json({ success: true, entry }, { status: 201 })
  } catch (error) {
    console.error('Entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create entry', details: String(error) },
      { status: 500 }
    )
  }
}
