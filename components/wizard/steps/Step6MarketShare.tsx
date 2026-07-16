'use client'

import { useState, useEffect } from 'react'

export default function Step6MarketShare({ data, updateData }: any) {
  const [enzymeCategories, setEnzymeCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lookups/enzyme-categories')
      .then(r => r.json())
      .then(enzymesData => {
        setEnzymeCategories(Array.isArray(enzymesData) ? enzymesData : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading enzymes:', error)
        setEnzymeCategories([])
        setLoading(false)
      })
  }, [])

  const handleMarketShareChange = (enzymeId: string, field: string, value: any) => {
    const enzymeValues = { ...(data.enzymeValues || {}) }
    if (!enzymeValues[enzymeId]) {
      enzymeValues[enzymeId] = {}
    }
    enzymeValues[enzymeId][field] = value
    updateData({ enzymeValues })
  }

  const getEnzymeValue = (enzymeId: string, field: string) => {
    return data.enzymeValues?.[enzymeId]?.[field]
  }

  const calculateTotal = (enzymeId: string) => {
    const iff = parseFloat(getEnzymeValue(enzymeId, 'iffMarketSharePercent') || 0)
    const novonesis = parseFloat(getEnzymeValue(enzymeId, 'novonesisMarketSharePercent') || 0)
    const dsm = parseFloat(getEnzymeValue(enzymeId, 'dsmMarketSharePercent') || 0)
    const others = parseFloat(getEnzymeValue(enzymeId, 'othersMarketSharePercent') || 0)
    return iff + novonesis + dsm + others
  }

  // Filter to only show enzymes with penetration > 0
  const enzymesWithPenetration = enzymeCategories.filter((enzyme) => {
    const penetration = getEnzymeValue(enzyme.id, 'penetrationPercent')
    return penetration != null && penetration > 0
  })

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (enzymesWithPenetration.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-block">
          <p className="text-yellow-800">
            No enzyme categories with penetration {">"} 0%.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            Go back to Step 5 to add enzyme penetration data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Step 6: Market Share Distribution
        </h2>
        <p className="text-gray-600 mb-6">
          For enzymes with penetration {">"} 0%, enter market share breakdown by supplier.
          <strong className="text-blue-600"> Total must equal 100% per enzyme.</strong>
        </p>
      </div>

      <div className="space-y-6">
        {enzymesWithPenetration.map((enzyme) => {
          const total = calculateTotal(enzyme.id)
          const isValid = Math.abs(total - 100) < 0.1
          const penetration = getEnzymeValue(enzyme.id, 'penetrationPercent')

          return (
            <div
              key={enzyme.id}
              className={`border-2 rounded-lg p-4 ${
                isValid
                  ? 'border-green-300 bg-green-50'
                  : total === 0
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{enzyme.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Penetration: {penetration}%
                  </p>
                </div>
                <div
                  className={`text-right ${
                    isValid
                      ? 'text-green-700'
                      : total === 0
                      ? 'text-gray-500'
                      : 'text-red-700'
                  }`}
                >
                  <div className="text-2xl font-bold">{total.toFixed(1)}%</div>
                  <div className="text-xs">
                    {isValid ? '✓ Valid' : total === 0 ? 'Enter shares' : '⚠ Must = 100%'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    IFF %
                  </label>
                  <input
                    type="number"
                    value={getEnzymeValue(enzyme.id, 'iffMarketSharePercent') || ''}
                    onChange={(e) =>
                      handleMarketShareChange(
                        enzyme.id,
                        'iffMarketSharePercent',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Novonesis %
                  </label>
                  <input
                    type="number"
                    value={getEnzymeValue(enzyme.id, 'novonesisMarketSharePercent') || ''}
                    onChange={(e) =>
                      handleMarketShareChange(
                        enzyme.id,
                        'novonesisMarketSharePercent',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    DSM %
                  </label>
                  <input
                    type="number"
                    value={getEnzymeValue(enzyme.id, 'dsmMarketSharePercent') || ''}
                    onChange={(e) =>
                      handleMarketShareChange(
                        enzyme.id,
                        'dsmMarketSharePercent',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Others %
                  </label>
                  <input
                    type="number"
                    value={getEnzymeValue(enzyme.id, 'othersMarketSharePercent') || ''}
                    onChange={(e) =>
                      handleMarketShareChange(
                        enzyme.id,
                        'othersMarketSharePercent',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium">Validation:</p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1">
          <li>✓ Each enzyme's market shares must total exactly 100%</li>
          <li>✓ You can use decimals (e.g., 33.3, 33.3, 33.4)</li>
          <li>✓ Enter 0 for suppliers not present in this market</li>
        </ul>
      </div>
    </div>
  )
}
