/**
 * Entries API Route
 *
 * Handles entry creation with:
 * - Professional error handling
 * - Input validation
 * - Duplicate detection
 * - Audit logging
 */

import { prisma } from '@/lib/prisma'
import {
  apiSuccess,
  apiCreated,
  apiError,
  asyncHandler,
  validateRequestBody,
} from '@/lib/api/apiResponse'
import { requireAuth } from '@/lib/api/apiMiddleware'
import { createEntrySchema, enzymeValueSchema } from '@/lib/validations/apiValidation'
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  BusinessLogicError,
} from '@/lib/errors/AppError'

/**
 * POST /api/entries
 * Create new entry
 */
export const POST = asyncHandler(async (request: Request) => {
  // 1. Authentication
  const user = await requireAuth()

  // 2. Parse and validate request body
  const body = await validateRequestBody(request)

  // 3. Validate main entry data
  const validatedData = createEntrySchema.parse({
    ...body,
    accountManagerUserId: user.id, // Set from session
  })

  console.log('[Entry Creation] Validated data:', {
    companyId: validatedData.companyId,
    countryId: validatedData.countryId,
    segmentId: validatedData.segmentId,
    status: validatedData.status,
  })

  // 4. Verify business segment exists
  const businessSegment = await prisma.businessSegment.findUnique({
    where: { id: validatedData.businessSegmentId },
  })

  if (!businessSegment) {
    throw new NotFoundError('Business segment')
  }

  // 5. Check for duplicate entry
  const existing = await prisma.entry.findFirst({
    where: {
      businessSegmentId: validatedData.businessSegmentId,
      cycleId: validatedData.cycleId,
      companyId: validatedData.companyId,
      countryId: validatedData.countryId,
      segmentId: validatedData.segmentId,
      plantId: validatedData.plantId || null,
    },
    include: {
      company: { select: { name: true } },
      country: { select: { countryName: true } },
      segment: { select: { name: true } },
      plant: { select: { name: true } },
    },
  })

  if (existing) {
    const plantInfo = existing.plant ? ` | Plant: ${existing.plant.name}` : ''
    throw new ConflictError(
      `Entry already exists: ${existing.company.name} | ${existing.country.countryName} | ${existing.segment.name}${plantInfo}. Please edit the existing entry instead.`
    )
  }

  // 6. Validate enzyme values if finalizing
  if (validatedData.finalized && body.enzymeValues) {
    const enzymeIds = Object.keys(body.enzymeValues)

    // Get enzyme names for better error messages
    const enzymes = await prisma.enzymeCategory.findMany({
      where: { id: { in: enzymeIds } },
      select: { id: true, name: true },
    })
    const enzymeMap = new Map(enzymes.map((e) => [e.id, e.name]))

    // Validate each enzyme value
    for (const enzymeId of enzymeIds) {
      const enzymeData = body.enzymeValues[enzymeId]

      // Validate with Zod schema
      const validated = enzymeValueSchema.parse({
        enzymeCategoryId: enzymeId,
        ...enzymeData,
      })

      // Business logic: If penetration > 0, market share must total 100%
      if (validated.penetrationPercent && validated.penetrationPercent > 0) {
        const total =
          (validated.iffMarketSharePercent || 0) +
          (validated.novonesisMarketSharePercent || 0) +
          (validated.dsmMarketSharePercent || 0) +
          (validated.othersMarketSharePercent || 0)

        if (Math.abs(total - 100) > 0.01) {
          const enzymeName = enzymeMap.get(enzymeId) || 'Enzyme'
          throw new BusinessLogicError(
            `${enzymeName} market share must total exactly 100% (currently ${total.toFixed(1)}%)`,
            { enzymeId, enzymeName, total }
          )
        }
      }
    }
  }

  // 7. Additional validation for finalized entries
  if (validatedData.finalized) {
    if (!validatedData.confidencePercent) {
      throw new ValidationError('Confidence percentage is required for finalized entries')
    }

    if (validatedData.goToMarket === 'distributor' && !validatedData.distributorId) {
      throw new ValidationError('Distributor is required when go-to-market is set to distributor')
    }
  }

  // 8. Create entry in database
  const entry = await prisma.entry.create({
    data: {
      businessSegmentId: validatedData.businessSegmentId,
      cycleId: validatedData.cycleId,
      accountManagerUserId: validatedData.accountManagerUserId,
      plantId: validatedData.plantId || null,
      companyId: validatedData.companyId,
      countryId: validatedData.countryId,
      region: validatedData.region,
      subregion: validatedData.subregion,
      existingCustomer: validatedData.existingCustomer,
      goToMarket: validatedData.goToMarket,
      distributorId: validatedData.distributorId || null,
      productionBeerHlYear: validatedData.productionBeerHlYear || null,
      segmentId: validatedData.segmentId,
      productionPercent: validatedData.productionPercent || null,
      confidencePercent: validatedData.confidencePercent || null,
      comments: validatedData.comments || null,
      status: validatedData.status,
      finalized: validatedData.finalized,
      approvalStatus: validatedData.finalized ? 'submitted' : 'pending',
      finalizedAt: validatedData.finalized ? new Date() : null,
    },
  })

  // 9. Create enzyme values if provided
  if (body.enzymeValues) {
    const enzymeRecords = Object.keys(body.enzymeValues).map((enzymeId) => ({
      entryId: entry.id,
      enzymeCategoryId: enzymeId,
      usageStatus: body.enzymeValues[enzymeId].usageStatus || 'unknown',
      penetrationPercent: body.enzymeValues[enzymeId].penetrationPercent || null,
      iffMarketSharePercent: body.enzymeValues[enzymeId].iffMarketSharePercent || null,
      novonesisMarketSharePercent:
        body.enzymeValues[enzymeId].novonesisMarketSharePercent || null,
      dsmMarketSharePercent: body.enzymeValues[enzymeId].dsmMarketSharePercent || null,
      othersMarketSharePercent: body.enzymeValues[enzymeId].othersMarketSharePercent || null,
      confirmed: true,
    }))

    await prisma.entryEnzymeValue.createMany({
      data: enzymeRecords,
    })
  }

  // 10. Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Entry',
      entityId: entry.id,
      action: validatedData.finalized ? 'finalized' : 'created',
      changedBy: user.id,
      newValue: JSON.stringify({
        status: validatedData.status,
        finalized: validatedData.finalized,
      }),
    },
  })

  console.log('[Entry Creation] Success:', entry.id)

  // 11. Return success response
  return apiCreated(
    entry,
    `Entry ${validatedData.finalized ? 'created and finalized' : 'saved as draft'} successfully`
  )
})
