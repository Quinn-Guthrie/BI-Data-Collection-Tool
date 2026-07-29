/**
 * Admin User [ID] API Route
 *
 * Manage individual user accounts
 */

import { prisma } from '@/lib/prisma'
import {
  apiSuccess,
  apiError,
  asyncHandler,
  validateRequestBody,
} from '@/lib/api/apiResponse'
import { requireSuperAdmin } from '@/lib/api/apiMiddleware'
import { updateUserSchema } from '@/lib/validations/apiValidation'
import { NotFoundError, ConflictError } from '@/lib/errors/AppError'
import * as bcrypt from 'bcryptjs'

/**
 * GET /api/admin/users/[id]
 * Get single user details
 */
export const GET = asyncHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireSuperAdmin()

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
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

  if (!user) {
    throw new NotFoundError('User')
  }

  return apiSuccess(user)
})

/**
 * PUT /api/admin/users/[id]
 * Update user
 */
export const PUT = asyncHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireSuperAdmin()
  const { id } = await params

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: { userSegments: true },
  })

  if (!existingUser) {
    throw new NotFoundError('User')
  }

  // Parse and validate request body
  const body = await validateRequestBody(request)
  const validatedData = updateUserSchema.parse(body)

  // Check email uniqueness if changing email
  if (validatedData.email && validatedData.email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (emailTaken) {
      throw new ConflictError('Email address is already in use')
    }
  }

  // Prepare update data
  const updateData: any = {}

  if (validatedData.name) updateData.name = validatedData.name
  if (validatedData.email) updateData.email = validatedData.email.toLowerCase()
  if (validatedData.role) updateData.role = validatedData.role
  if (validatedData.active !== undefined) updateData.active = validatedData.active

  // Hash new password if provided
  if (validatedData.password) {
    updateData.password = await bcrypt.hash(validatedData.password, 12)
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      userSegments: {
        include: {
          segment: true,
        },
      },
    },
  })

  // Update segment assignments if provided
  if (validatedData.segments) {
    // Delete existing assignments
    await prisma.userSegment.deleteMany({
      where: { userId: id },
    })

    // Create new assignments
    if (validatedData.segments.length > 0) {
      await prisma.userSegment.createMany({
        data: validatedData.segments.map((segmentId) => ({
          userId: id,
          segmentId,
          role: 'account_manager',
          assignedBy: admin.id,
        })),
      })
    }

    // Fetch updated user with new segments
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
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
        entityId: id,
        action: 'updated',
        changedBy: admin.id,
        oldValue: JSON.stringify({
          email: existingUser.email,
          segments: existingUser.userSegments.map((us) => us.segmentId),
        }),
        newValue: JSON.stringify({
          email: user.email,
          segments: validatedData.segments,
        }),
      },
    })

    return apiSuccess(updatedUser, 'User updated successfully')
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'User',
      entityId: id,
      action: 'updated',
      changedBy: admin.id,
      oldValue: JSON.stringify({ email: existingUser.email }),
      newValue: JSON.stringify({ email: user.email }),
    },
  })

  return apiSuccess(user, 'User updated successfully')
})

/**
 * DELETE /api/admin/users/[id]
 * Delete user
 */
export const DELETE = asyncHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireSuperAdmin()
  const { id } = await params

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  // Prevent deleting yourself
  if (user.id === admin.id) {
    throw new ConflictError('Cannot delete your own account')
  }

  // Delete user (cascade will delete userSegments)
  await prisma.user.delete({
    where: { id },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'User',
      entityId: id,
      action: 'deleted',
      changedBy: admin.id,
      oldValue: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    },
  })

  console.log('[User Deletion] Success:', id)

  return apiSuccess({ id }, 'User deleted successfully')
})
