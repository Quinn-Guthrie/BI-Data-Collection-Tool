/**
 * Admin Users API Route
 *
 * Manages user accounts with professional error handling
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
import { createUserSchema } from '@/lib/validations/apiValidation'
import { ConflictError, ValidationError } from '@/lib/errors/AppError'
import * as bcrypt from 'bcryptjs'

/**
 * GET /api/admin/users
 * Get all users (super admin only)
 */
export const GET = asyncHandler(async (request: Request) => {
  // Require super admin
  await requireSuperAdmin()

  // Fetch all users with their segment assignments
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      userSegments: {
        include: {
          segment: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return apiSuccess(users)
})

/**
 * POST /api/admin/users
 * Create new user (super admin only)
 */
export const POST = asyncHandler(async (request: Request) => {
  // Require super admin
  const admin = await requireSuperAdmin()

  // Parse and validate request body
  const body = await validateRequestBody(request)

  // Validate with Zod schema
  const validatedData = createUserSchema.parse(body)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() },
  })

  if (existingUser) {
    throw new ConflictError('A user with this email already exists')
  }

  // Validate segments
  if (!validatedData.segments || validatedData.segments.length === 0) {
    throw new ValidationError('At least one business segment must be assigned')
  }

  // Verify all segments exist
  const segments = await prisma.businessSegment.findMany({
    where: { id: { in: validatedData.segments } },
  })

  if (segments.length !== validatedData.segments.length) {
    throw new ValidationError('One or more invalid business segments selected')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 12)

  // Create user with segment assignments
  const user = await prisma.user.create({
    data: {
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      name: validatedData.name,
      role: validatedData.role,
      active: true,
      userSegments: {
        create: validatedData.segments.map((segmentId) => ({
          segmentId,
          role: 'account_manager',
          assignedBy: admin.id,
        })),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      userSegments: {
        include: {
          segment: true,
        },
      },
    },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'User',
      entityId: user.id,
      action: 'created',
      changedBy: admin.id,
      newValue: JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        segments: validatedData.segments,
        createdBy: admin.email,
      }),
    },
  })

  console.log('[User Creation] Success:', user.id)

  return apiCreated(user, 'User created successfully')
})
