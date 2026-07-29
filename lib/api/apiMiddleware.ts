/**
 * API Middleware
 *
 * Reusable middleware for authentication, authorization, and validation
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/AppError'

/**
 * Get authenticated user from session
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    throw new UnauthorizedError('You must be logged in to perform this action')
  }

  return session.user
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()

  if (user.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required')
  }

  return user
}

/**
 * Check if user has access to specific segment
 */
export async function requireSegmentAccess(segmentId: string) {
  const user = await requireAuth()

  // Super admins have access to all segments
  if (user.role === 'super_admin') {
    return user
  }

  // Check if user has access to this segment
  const { prisma } = await import('@/lib/prisma')

  const hasAccess = await prisma.userSegment.findFirst({
    where: {
      userId: user.id,
      segmentId: segmentId,
    },
  })

  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this segment')
  }

  return user
}

/**
 * Check if user owns a resource (e.g., their own entry)
 */
export async function requireOwnership(resourceUserId: string) {
  const user = await requireAuth()

  // Super admins can access anything
  if (user.role === 'super_admin') {
    return user
  }

  // Check ownership
  if (user.id !== resourceUserId) {
    throw new ForbiddenError('You can only access your own resources')
  }

  return user
}

/**
 * Combine multiple middleware checks
 */
export async function requireAll(...checks: (() => Promise<any>)[]) {
  for (const check of checks) {
    await check()
  }
}

/**
 * Require at least one condition to be true
 */
export async function requireAny(...checks: (() => Promise<any>)[]): Promise<any> {
  const errors: Error[] = []

  for (const check of checks) {
    try {
      return await check()
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error)
      }
    }
  }

  // All checks failed
  throw new ForbiddenError('Insufficient permissions')
}
