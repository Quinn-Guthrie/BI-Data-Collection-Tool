/**
 * API Input Validation Schemas
 *
 * Validates all user input BEFORE processing
 * Uses Zod for type-safe validation
 */

import { z } from 'zod'

/**
 * User Validation
 */
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['super_admin', 'account_manager'], {
    errorMap: () => ({ message: 'Role must be super_admin or account_manager' }),
  }),
  segments: z.array(z.string()).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .optional(),
  role: z.enum(['super_admin', 'account_manager']).optional(),
  segments: z.array(z.string()).optional(),
  active: z.boolean().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Cycle Validation
 */
export const createCycleSchema = z.object({
  name: z.string().min(1, 'Cycle name is required').max(100),
  segmentId: z.string().min(1, 'Business segment is required'),
})

/**
 * Entry Validation
 */
export const createEntrySchema = z
  .object({
    cycleId: z.string().min(1, 'Cycle is required'),
    businessSegmentId: z.string().min(1, 'Business segment is required'),
    accountManagerUserId: z.string().min(1, 'Account manager is required'),

    // Company & Location
    companyId: z.string().min(1, 'Company is required'),
    countryId: z.string().min(1, 'Country is required'),
    region: z.string().min(1, 'Region is required'),
    subregion: z.string().min(1, 'Subregion is required'),
    plantId: z.string().nullable().optional(),

    // Customer Info
    existingCustomer: z.enum(['yes', 'no'], {
      errorMap: () => ({ message: 'Existing customer must be yes or no' }),
    }),
    goToMarket: z.enum(['direct', 'distributor'], {
      errorMap: () => ({ message: 'Go-to-market must be direct or distributor' }),
    }),
    distributorId: z.string().nullable().optional(),

    // Production
    productionBeerHlYear: z
      .number()
      .min(0, 'Production must be 0 or greater')
      .max(999999999, 'Production value too large')
      .nullable()
      .optional(),

    // Segment
    segmentId: z.string().min(1, 'Product segment is required'),
    productionPercent: z
      .number()
      .min(0, 'Production % must be between 0-100')
      .max(100, 'Production % must be between 0-100')
      .nullable()
      .optional(),

    // Confidence & Comments
    confidencePercent: z
      .number()
      .min(0, 'Confidence must be between 0-100')
      .max(100, 'Confidence must be between 0-100')
      .nullable()
      .optional(),
    comments: z.string().max(5000, 'Comments too long (max 5000 characters)').nullable().optional(),

    // Status
    status: z
      .enum(['draft', 'finalized', 'carried_over_unconfirmed', 'not_started'])
      .default('draft'),
    finalized: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If go-to-market is distributor, distributorId is required
      if (data.goToMarket === 'distributor' && !data.distributorId) {
        return false
      }
      return true
    },
    {
      message: 'Distributor is required when go-to-market is set to distributor',
      path: ['distributorId'],
    }
  )

export const updateEntrySchema = createEntrySchema.partial()

/**
 * Enzyme Value Validation
 */
export const enzymeValueSchema = z
  .object({
    enzymeCategoryId: z.string().min(1, 'Enzyme category is required'),
    usageStatus: z.string().nullable().optional(),
    penetrationPercent: z
      .number()
      .min(0, 'Penetration must be between 0-100')
      .max(100, 'Penetration must be between 0-100')
      .nullable()
      .optional(),

    // Market Share (must total 100% when penetration > 0)
    iffMarketSharePercent: z
      .number()
      .min(0, 'Market share must be between 0-100')
      .max(100, 'Market share must be between 0-100')
      .nullable()
      .optional(),
    novonesisMarketSharePercent: z
      .number()
      .min(0, 'Market share must be between 0-100')
      .max(100, 'Market share must be between 0-100')
      .nullable()
      .optional(),
    dsmMarketSharePercent: z
      .number()
      .min(0, 'Market share must be between 0-100')
      .max(100, 'Market share must be between 0-100')
      .nullable()
      .optional(),
    othersMarketSharePercent: z
      .number()
      .min(0, 'Market share must be between 0-100')
      .max(100, 'Market share must be between 0-100')
      .nullable()
      .optional(),

    confirmed: z.boolean().default(false),
    comments: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (data) => {
      // If penetration > 0, market share must total 100%
      if (data.penetrationPercent && data.penetrationPercent > 0) {
        const total =
          (data.iffMarketSharePercent || 0) +
          (data.novonesisMarketSharePercent || 0) +
          (data.dsmMarketSharePercent || 0) +
          (data.othersMarketSharePercent || 0)

        // Allow small floating point differences
        return Math.abs(total - 100) < 0.01
      }
      return true
    },
    {
      message: 'Market share must total exactly 100% when penetration is greater than 0',
      path: ['iffMarketSharePercent'],
    }
  )

/**
 * Approval Validation
 */
export const approvalSchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be approve or reject' }),
  }),
  reason: z.string().max(1000, 'Reason too long').optional(),
})

/**
 * Export Validation
 */
export const exportSchema = z.object({
  segmentId: z.string().optional(),
  cycleId: z.string().optional(),
  status: z.enum(['draft', 'finalized', 'carried_over_unconfirmed', 'not_started']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

/**
 * Pagination Validation
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'Page must be 1 or greater')
    .default(1)
    .or(z.string().transform((val) => parseInt(val, 10))),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be 1 or greater')
    .max(100, 'Limit cannot exceed 100')
    .default(20)
    .or(z.string().transform((val) => parseInt(val, 10))),
})

/**
 * Generic ID validation
 */
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

/**
 * Helper function to validate data against schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Helper function to safely validate and return errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}
