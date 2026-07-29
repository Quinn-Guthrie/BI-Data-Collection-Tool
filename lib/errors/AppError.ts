/**
 * Custom Application Error Classes
 *
 * Professional error handling with:
 * - Consistent error codes
 * - HTTP status codes
 * - User-friendly messages
 * - Logging support
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)

    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.details = details

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details)
  }
}

/**
 * 401 Unauthorized - Not logged in
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED', true)
  }
}

/**
 * 403 Forbidden - Logged in but no permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN', true)
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true)
  }
}

/**
 * 409 Conflict - Duplicate or conflict with existing data
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT', true)
  }
}

/**
 * 422 Unprocessable Entity - Valid format but business logic fails
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', true, details)
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true)
  }
}

/**
 * 500 Internal Server Error - Unexpected error
 */
export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred', details?: any) {
    super(message, 500, 'INTERNAL_ERROR', false, details)
  }
}

/**
 * 503 Service Unavailable - External service down
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Service') {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE', true)
  }
}

/**
 * Database-specific errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', false, details)
  }
}
