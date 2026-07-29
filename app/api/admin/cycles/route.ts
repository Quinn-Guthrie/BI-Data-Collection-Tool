/**
 * Admin Cycles API Route
 *
 * Manage data collection cycles
 */

import { prisma } from '@/lib/prisma'
import {
  apiSuccess,
  apiCreated,
  apiError,
  asyncHandler,
  validateRequestBody,
} from '@/lib/api/apiResponse'
import { requireSuperAdmin } from '@/lib/api/apiMiddleware'
import { createCycleSchema } from '@/lib/validations/apiValidation'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors/AppError'

/**
 * GET /api/admin/cycles
 * Get all cycles
 */
export const GET = asyncHandler(async (request: Request) => {
  await requireSuperAdmin()

  const cycles = await prisma.cycle.findMany({
    include: {
      segment: true,
      _count: {
        select: { entries: true },
      },
    },
    orderBy: [{ status: 'asc' }, { openedAt: 'desc' }],
  })

  return apiSuccess(cycles)
})

/**
 * POST /api/admin/cycles
 * Create new cycle
 */
export const POST = asyncHandler(async (request: Request) => {
  const admin = await requireSuperAdmin()

  // Parse and validate request body
  const body = await validateRequestBody(request)
  const validatedData = createCycleSchema.parse(body)

  // Verify business segment exists
  const segment = await prisma.businessSegment.findUnique({
    where: { id: validatedData.segmentId },
  })

  if (!segment) {
    throw new NotFoundError('Business segment')
  }

  // Check if there's already an open cycle for this segment
  const existingOpenCycle = await prisma.cycle.findFirst({
    where: {
      segmentId: validatedData.segmentId,
      status: 'open',
    },
    include: {
      segment: true,
    },
  })

  if (existingOpenCycle) {
    throw new ConflictError(
      `There is already an open cycle for ${existingOpenCycle.segment.name}. Lock it before creating a new one.`
    )
  }

  // Create new cycle
  const cycle = await prisma.cycle.create({
    data: {
      name: validatedData.name,
      segmentId: validatedData.segmentId,
      status: 'open',
      openedAt: new Date(),
      createdBy: admin.id,
    },
    include: {
      segment: true,
    },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Cycle',
      entityId: cycle.id,
      action: 'created',
      changedBy: admin.id,
      newValue: JSON.stringify({
        name: cycle.name,
        segment: segment.name,
        status: 'open',
      }),
    },
  })

  console.log('[Cycle Creation] Success:', cycle.id)

  return apiCreated(cycle, `Cycle "${cycle.name}" created successfully for ${segment.name}`)
})
