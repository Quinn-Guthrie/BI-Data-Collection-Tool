import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sourceCycleId } = await params
    const body = await request.json()
    const { targetCycleId } = body

    if (!targetCycleId) {
      return NextResponse.json(
        { error: 'Target cycle ID is required' },
        { status: 400 }
      )
    }

    // Get all finalized entries from source cycle
    const sourceEntries = await prisma.entry.findMany({
      where: {
        cycleId: sourceCycleId,
        finalized: true,
      },
      include: {
        enzymeValues: true,
      },
    })

    let copiedCount = 0

    // Copy each entry to the new cycle
    for (const sourceEntry of sourceEntries) {
      // Check if entry already exists in target cycle
      const existingEntry = await prisma.entry.findFirst({
        where: {
          cycleId: targetCycleId,
          companyId: sourceEntry.companyId,
          countryId: sourceEntry.countryId,
          segmentId: sourceEntry.segmentId,
          plantId: sourceEntry.plantId,
        },
      })

      if (existingEntry) {
        continue // Skip if already exists
      }

      // Create new entry
      const newEntry = await prisma.entry.create({
        data: {
          cycleId: targetCycleId,
          sourceEntryId: sourceEntry.id,
          accountManagerUserId: sourceEntry.accountManagerUserId,
          plantId: sourceEntry.plantId,
          companyId: sourceEntry.companyId,
          countryId: sourceEntry.countryId,
          region: sourceEntry.region,
          subregion: sourceEntry.subregion,
          existingCustomer: sourceEntry.existingCustomer,
          goToMarket: sourceEntry.goToMarket,
          distributorId: sourceEntry.distributorId,
          productionBeerHlYear: sourceEntry.productionBeerHlYear,
          segmentId: sourceEntry.segmentId,
          productionPercent: sourceEntry.productionPercent,
          confidencePercent: null, // Reset confidence
          comments: null, // Reset comments
          status: 'carried_over_unconfirmed',
          finalized: false,
          approvalStatus: 'pending',
          finalizedAt: null,
        },
      })

      // Copy enzyme values with confirmed=false
      if (sourceEntry.enzymeValues && sourceEntry.enzymeValues.length > 0) {
        const enzymeValueData = sourceEntry.enzymeValues.map((ev) => ({
          entryId: newEntry.id,
          enzymeCategoryId: ev.enzymeCategoryId,
          usageStatus: ev.usageStatus,
          penetrationPercent: ev.penetrationPercent,
          iffMarketSharePercent: ev.iffMarketSharePercent,
          novonesisMarketSharePercent: ev.novonesisMarketSharePercent,
          dsmMarketSharePercent: ev.dsmMarketSharePercent,
          othersMarketSharePercent: ev.othersMarketSharePercent,
          confirmed: false, // Must be confirmed by user
        }))

        await prisma.entryEnzymeValue.createMany({
          data: enzymeValueData,
        })
      }

      copiedCount++
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Cycle',
        entityId: targetCycleId,
        action: 'carry_forward',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          sourceCycleId,
          targetCycleId,
          entriesCopied: copiedCount,
          carriedForwardBy: session.user.email,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Carried forward ${copiedCount} entries`,
      count: copiedCount,
    })
  } catch (error) {
    console.error('Error carrying forward entries:', error)
    return NextResponse.json(
      { error: 'Failed to carry forward entries' },
      { status: 500 }
    )
  }
}
