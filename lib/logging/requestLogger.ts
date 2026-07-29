/**
 * Request Logger Middleware
 *
 * Logs all API requests with timing and context
 */

import { logRequest, logError } from './logger'
import { NextResponse } from 'next/server'

/**
 * Wrap API handler with request logging
 */
export function withRequestLogging(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    const startTime = Date.now()
    const url = new URL(req.url)
    const method = req.method

    try {
      // Execute handler
      const response = await handler(req, context)

      // Log successful request
      const duration = Date.now() - startTime
      logRequest(method, url.pathname, undefined, duration)

      // Add timing header
      response.headers.set('X-Response-Time', `${duration}ms`)

      return response
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      logError('Request failed', error, {
        method,
        url: url.pathname,
        duration,
      })

      throw error
    }
  }
}

/**
 * Extract user info from request
 */
export function getUserFromRequest(req: Request): string | undefined {
  // This would extract from session/token
  // For now, return undefined
  return undefined
}
