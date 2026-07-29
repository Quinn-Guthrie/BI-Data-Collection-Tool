/**
 * Enhanced Logging System
 *
 * Professional logging with Winston:
 * - Structured logs
 * - Multiple log levels
 * - File and console output
 * - Request tracking
 * - Performance monitoring
 */

import winston from 'winston'
import path from 'path'

/**
 * Log levels:
 * error: 0 - Critical errors
 * warn: 1 - Warning conditions
 * info: 2 - Informational messages
 * http: 3 - HTTP requests
 * debug: 4 - Debug information
 */

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

/**
 * Console format (colorized for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`
    }

    return log
  })
)

/**
 * Create Winston logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test',
    }),

    // File output - all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),

    // File output - errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
})

/**
 * Log API request
 */
export function logRequest(
  method: string,
  url: string,
  userId?: string,
  duration?: number
) {
  logger.http('API Request', {
    method,
    url,
    userId,
    duration: duration ? `${duration}ms` : undefined,
  })
}

/**
 * Log API error
 */
export function logError(
  message: string,
  error: unknown,
  context?: Record<string, any>
) {
  logger.error(message, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    ...context,
  })
}

/**
 * Log database query
 */
export function logQuery(
  operation: string,
  model: string,
  duration?: number,
  error?: unknown
) {
  if (error) {
    logger.error('Database Query Failed', {
      operation,
      model,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof Error ? error.message : error,
    })
  } else {
    logger.debug('Database Query', {
      operation,
      model,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

/**
 * Log authentication event
 */
export function logAuth(
  event: 'login' | 'logout' | 'failed_login' | 'session_expired',
  userId?: string,
  email?: string,
  ip?: string
) {
  logger.info('Auth Event', {
    event,
    userId,
    email,
    ip,
  })
}

/**
 * Log business event
 */
export function logBusiness(
  event: string,
  details: Record<string, any>
) {
  logger.info('Business Event', {
    event,
    ...details,
  })
}

/**
 * Log security event
 */
export function logSecurity(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn'

  logger[level]('Security Event', {
    event,
    severity,
    ...details,
  })
}

/**
 * Log performance metric
 */
export function logPerformance(
  operation: string,
  duration: number,
  details?: Record<string, any>
) {
  const level = duration > 5000 ? 'warn' : 'debug'

  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    slow: duration > 5000,
    ...details,
  })
}

/**
 * Create child logger with context
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

export default logger
