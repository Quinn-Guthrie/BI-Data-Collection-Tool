/**
 * Cycle Lock API Route
 *
 * Lock/unlock cycles for data collection
 */

import { prisma } from '@/lib/prisma'
import { apiSuccess, asyncHandler } from '@/lib/api/apiResponse'
import { requireSuperAdmin } from '@/lib/api/apiMiddleware'
import { NotFoundError, BusinessLogicError } from '@/lib/errors/AppError'

/**
 * POST /api/admin/cycles/[id]/lock
 * Lock a cycle (prevents new entries)
 */
export const POST = asyncHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const admin = await requireSuperAdmin()
  const { id } = await params

  // Check if cycle exists
  const cycle = await prisma.cycle.findUnique({
    where: { id },
    include: { segment: true },
  })

  if (!cycle) {
    throw new NotFoundError('Cycle')
  }

  // Check if already locked
  if (cycle.status === 'locked') {
    throw new BusinessLogicError('Cycle is already locked')
  }

  // Lock the cycle
  const updatedCycle = await prisma.cycle.update({
    where: { id },
    data: {
      status: 'locked',
      lockedAt: new Date(),
    },
    include: { segment: true },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Cycle',
      entityId: id,
      action: 'locked',
      changedBy: admin.id,
      newValue: JSON.stringify({
        status: 'locked',
        lockedAt: updatedCycle.lockedAt,
        lockedBy: admin.email,
        segment: cycle.segment.name,
      }),
    },
  })

  console.log('[Cycle Lock] Success:', id)

  return apiSuccess(
    updatedCycle,
    `Cycle "${cycle.name}" locked successfully. No new entries can be created.`
  )
})

/**
 * DELETE /api/admin/cycles/[id]/lock
 * Unlock a cycle (allow new entries)
 */
export const DELETE = asyncHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const admin = await requireSuperAdmin()
  const { id } = await params

  // Check if cycle exists
  const cycle = await prisma.cycle.findUnique({
    where: { id },
    include: { segment: true },
  })

  if (!cycle) {
    throw new NotFoundError('Cycle')
  }

  // Check if already open
  if (cycle.status === 'open') {
    throw new BusinessLogicError('Cycle is already open')
  }

  // Unlock the cycle
  const updatedCycle = await prisma.cycle.update({
    where: { id },
    data: {
      status: 'open',
      lockedAt: null,
    },
    include: { segment: true },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Cycle',
      entityId: id,
      action: 'unlocked',
      changedBy: admin.id,
      newValue: JSON.stringify({
        status: 'open',
        unlockedBy: admin.email,
        segment: cycle.segment.name,
      }),
    },
  })

  console.log('[Cycle Unlock] Success:', id)

  return apiSuccess(
    updatedCycle,
    `Cycle "${cycle.name}" unlocked successfully. Users can now create entries.`
  )
})
