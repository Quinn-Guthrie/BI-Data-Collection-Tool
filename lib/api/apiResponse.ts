/**
 * Standardized API Response Handler
 *
 * Ensures all API responses follow the same format
 * Makes frontend handling consistent and predictable
 */

import { NextResponse } from 'next/server'
import { AppError } from '@/lib/errors/AppError'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

/**
 * Success Response Format
 */
interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

/**
 * Error Response Format
 */
interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: any
    stack?: string // Only in development
  }
}

/**
 * Send success response
 */
export function apiSuccess<T>(data: T, message?: string, meta?: any): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  }

  if (message) {
    response.message = message
  }

  if (meta) {
    response.meta = meta
  }

  return NextResponse.json(response, { status: 200 })
}

/**
 * Send created response (201)
 */
export function apiCreated<T>(data: T, message?: string): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    },
    { status: 201 }
  )
}

/**
 * Send error response
 */
export function apiError(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): NextResponse<ErrorResponse> {
  // Handle our custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Database validation error',
          code: 'DATABASE_VALIDATION_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 400 }
    )
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: process.env.NODE_ENV === 'development' ? error.message : defaultMessage,
          code: 'INTERNAL_ERROR',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    {
      success: false,
      error: {
        message: defaultMessage,
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  )
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse<ErrorResponse> {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const target = (error.meta?.target as string[]) || []
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `A record with this ${target.join(', ')} already exists`,
            code: 'DUPLICATE_ENTRY',
            details: { fields: target },
          },
        },
        { status: 409 }
      )
    }

    // Foreign key constraint violation
    case 'P2003': {
      const field = error.meta?.field_name as string
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Invalid reference: ${field} does not exist`,
            code: 'FOREIGN_KEY_ERROR',
            details: { field },
          },
        },
        { status: 400 }
      )
    }

    // Record not found
    case 'P2025': {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    // Connection error
    case 'P1001':
    case 'P1002':
    case 'P1008': {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Database connection failed',
            code: 'DATABASE_CONNECTION_ERROR',
          },
        },
        { status: 503 }
      )
    }

    // Timeout
    case 'P2024': {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Database operation timed out',
            code: 'DATABASE_TIMEOUT',
          },
        },
        { status: 504 }
      )
    }

    // Generic Prisma error
    default: {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Database error occurred',
            code: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrap async route handlers with error handling
 */
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error('[API Error]', error)
      return apiError(error)
    }
  }
}

/**
 * Validate request body
 */
export async function validateRequestBody(req: Request): Promise<any> {
  try {
    const body = await req.json()
    return body
  } catch (error) {
    throw new AppError('Invalid JSON in request body', 400, 'INVALID_JSON')
  }
}

/**
 * Extract query parameters with type safety
 */
export function getQueryParams(url: string, schema?: any): any {
  const { searchParams } = new URL(url)
  const params: any = {}

  searchParams.forEach((value, key) => {
    params[key] = value
  })

  if (schema) {
    return schema.parse(params)
  }

  return params
}
