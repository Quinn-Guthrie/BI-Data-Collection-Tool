import { z } from 'zod'

export const entrySchema = z.object({
  // Step 1: Account (auto-filled)
  cycleId: z.string().min(1, 'Cycle is required'),
  accountManagerUserId: z.string().min(1, 'Account manager is required'),

  // Step 2: Plant & Company
  plantId: z.string().optional().nullable(),
  companyId: z.string().min(1, 'Company is required'),
  countryId: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  subregion: z.string().min(1, 'Subregion is required'),

  // Step 3: Company Details
  existingCustomer: z.enum(['yes', 'no']),
  goToMarket: z.enum(['direct', 'distributor']),
  distributorId: z.string().optional().nullable(),
  productionBeerHlYear: z
    .number()
    .min(0, 'Production must be 0 or greater')
    .optional()
    .nullable(),

  // Step 4: Segment
  segmentId: z.string().min(1, 'Segment is required'),
  productionPercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),

  // Step 7: Confidence & Comments
  confidencePercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
  comments: z.string().optional(),
})

export const enzymeValueSchema = z.object({
  enzymeCategoryId: z.string(),
  usageStatus: z.enum(['used', 'not_used', 'unknown']).optional(),
  penetrationPercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
  iffMarketSharePercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
  novonesisMarketSharePercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
  dsmMarketSharePercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
  othersMarketSharePercent: z
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100')
    .optional()
    .nullable(),
})

export type EntryFormData = z.infer<typeof entrySchema>
export type EnzymeValueData = z.infer<typeof enzymeValueSchema>
