/**
 * Database Retry Logic
 *
 * Automatically retry failed database operations with exponential backoff
 */

import { Prisma } from '@prisma/client'
import { DatabaseError } from '@/lib/errors/AppError'

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Connection errors
    if (['P1001', 'P1002', 'P1008', 'P1017'].includes(error.code)) {
      return true
    }

    // Timeout errors
    if (error.code === 'P2024') {
      return true
    }

    // Transaction conflicts
    if (error.code === 'P2034') {
      return true
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return true
  }

  return false
}

/**
 * Retry options
 */
interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

/**
 * Execute database operation with automatic retry
 *
 * @param operation - Function that returns a Promise
 * @param options - Retry configuration
 * @returns Result of the operation
 * @throws DatabaseError if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 100,
    maxDelay = 5000,
    backoffMultiplier = 2,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Attempt the operation
      return await operation()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (!isRetryableError(error)) {
        // Not retryable, throw immediately
        throw error
      }

      // Check if we've exhausted retries
      if (attempt === maxAttempts) {
        console.error(
          `[DB Retry] Failed after ${maxAttempts} attempts:`,
          error
        )
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      )

      console.warn(
        `[DB Retry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : 'Unknown error'
      )

      // Wait before retrying
      await sleep(delay)
    }
  }

  // All retries failed
  throw new DatabaseError(
    'Database operation failed after multiple retries',
    lastError
  )
}

/**
 * Execute multiple operations in a transaction with retry
 */
export async function withRetryTransaction<T>(
  operations: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { prisma } = await import('@/lib/prisma')

  return withRetry(
    () => prisma.$transaction(operations),
    options
  )
}

/**
 * Helper: Retry a Prisma query
 */
export async function retryQuery<T>(
  query: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return withRetry(query, options)
}

/**
 * Helper: Retry a Prisma mutation (create, update, delete)
 */
export async function retryMutation<T>(
  mutation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return withRetry(mutation, {
    maxAttempts: 5, // More retries for mutations
    ...options,
  })
}
