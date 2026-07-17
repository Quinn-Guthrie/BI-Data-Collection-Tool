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

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: newCycleId } = await params

    // Get the new cycle
    const newCycle = await prisma.cycle.findUnique({
      where: { id: newCycleId },
      include: { businessSegment: true },
    })

    if (!newCycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    if (newCycle.status !== 'open') {
      return NextResponse.json(
        { error: 'Can only carry forward to open cycles' },
        { status: 400 }
      )
    }

    // Check if this cycle already has entries
    const existingEntries = await prisma.entry.count({
      where: { cycleId: newCycleId },
    })

    if (existingEntries > 0) {
      return NextResponse.json(
        { error: 'Cycle already has entries. Cannot carry forward.' },
        { status: 400 }
      )
    }

    // Find the most recent locked cycle in the same business segment
    const previousCycle = await prisma.cycle.findFirst({
      where: {
        businessSegmentId: newCycle.businessSegmentId,
        status: 'locked',
        id: { not: newCycleId },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!previousCycle) {
      return NextResponse.json(
        { error: 'No previous locked cycle found to carry forward from' },
        { status: 404 }
      )
    }

    // Get all finalized entries from previous cycle
    const previousEntries = await prisma.entry.findMany({
      where: {
        cycleId: previousCycle.id,
        status: 'finalized',
      },
      include: {
        enzymeValues: true,
        segments: true,
      },
    })

    if (previousEntries.length === 0) {
      return NextResponse.json(
        { error: 'No finalized entries found in previous cycle' },
        { status: 404 }
      )
    }

    // Clone entries
    let clonedCount = 0

    for (const oldEntry of previousEntries) {
      // Create new entry
      const newEntry = await prisma.entry.create({
        data: {
          cycleId: newCycleId,
          businessSegmentId: newCycle.businessSegmentId,
          accountManagerUserId: oldEntry.accountManagerUserId,
          companyId: oldEntry.companyId,
          countryId: oldEntry.countryId,
          plantId: oldEntry.plantId,
          isExistingCustomer: oldEntry.isExistingCustomer,
          goToMarket: oldEntry.goToMarket,
          distributorId: oldEntry.distributorId,
          productionHlPerYear: oldEntry.productionHlPerYear,
          status: 'carried_over_unconfirmed',
          sourceEntryId: oldEntry.id,
          // DO NOT copy: confidencePercent, comments, finalizedAt, approvalStatus
        },
      })

      // Clone product segments
      for (const oldSegment of oldEntry.segments) {
        await prisma.entrySegment.create({
          data: {
            entryId: newEntry.id,
            segmentId: oldSegment.segmentId,
            productionPercent: oldSegment.productionPercent,
          },
        })
      }

      // Clone enzyme values with confirmed: false
      for (const oldEnzyme of oldEntry.enzymeValues) {
        await prisma.entryEnzymeValue.create({
          data: {
            entryId: newEntry.id,
            enzymeCategoryId: oldEnzyme.enzymeCategoryId,
            usageStatus: oldEnzyme.usageStatus,
            penetrationPercent: oldEnzyme.penetrationPercent,
            iffPercent: oldEnzyme.iffPercent,
            novonesisDsmPercent: oldEnzyme.novonesisDsmPercent,
            otherPercent: oldEnzyme.otherPercent,
            confirmed: false, // Must be confirmed by user
          },
        })
      }

      clonedCount++
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Cycle',
        entityId: newCycleId,
        action: 'carry_forward',
        changedBy: session.user.id,
        newValue: JSON.stringify({
          fromCycle: previousCycle.name,
          entriesCloned: clonedCount,
          performedBy: session.user.email,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully carried forward ${clonedCount} entries from "${previousCycle.name}"`,
      clonedCount,
      fromCycle: previousCycle.name,
      toCycle: newCycle.name,
    })
  } catch (error) {
    console.error('Error carrying forward entries:', error)
    return NextResponse.json(
      { error: 'Failed to carry forward entries' },
      { status: 500 }
    )
  }
}
