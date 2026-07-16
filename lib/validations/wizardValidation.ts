// Client-side validation helpers for wizard

export function validateMarketShares(enzymeValues: Record<string, any>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  Object.entries(enzymeValues).forEach(([enzymeId, value]: [string, any]) => {
    const penetration = value.penetrationPercent || 0

    // Only validate market share if penetration > 0
    if (penetration > 0) {
      const total =
        (value.iffMarketSharePercent || 0) +
        (value.novonesisMarketSharePercent || 0) +
        (value.dsmMarketSharePercent || 0) +
        (value.othersMarketSharePercent || 0)

      // Allow 0.1% tolerance for rounding
      if (Math.abs(total - 100) > 0.1) {
        errors.push(
          `Market share must total 100% for enzymes with penetration (currently ${total.toFixed(
            1
          )}%)`
        )
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateRequiredFields(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.companyId) errors.push('Company is required')
  if (!data.countryId) errors.push('Country is required')
  if (!data.segmentId) errors.push('Segment is required')
  if (!data.existingCustomer) errors.push('Existing customer status is required')
  if (!data.goToMarket) errors.push('Go-to-market method is required')

  if (data.goToMarket === 'distributor' && !data.distributorId) {
    errors.push('Distributor is required when go-to-market is distributor')
  }

  if (data.productionBeerHlYear === null || data.productionBeerHlYear === undefined) {
    errors.push('Production (HL/year) is required')
  }

  if (data.productionPercent === null || data.productionPercent === undefined) {
    errors.push('Production percentage is required')
  }

  if (data.confidencePercent === null || data.confidencePercent === undefined) {
    errors.push('Confidence percentage is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateAllBeforeFinalize(data: any): {
  isValid: boolean
  errors: string[]
} {
  const requiredValidation = validateRequiredFields(data)
  const marketShareValidation = validateMarketShares(data.enzymeValues || {})

  const allErrors = [...requiredValidation.errors, ...marketShareValidation.errors]

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}
