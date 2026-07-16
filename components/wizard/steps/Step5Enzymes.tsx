'use client'

import { useState, useEffect } from 'react'

export default function Step5Enzymes({ data, updateData }: any) {
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

  const handleEnzymeChange = (enzymeId: string, field: string, value: any) => {
    const enzymeValues = { ...(data.enzymeValues || {}) }
    if (!enzymeValues[enzymeId]) {
      enzymeValues[enzymeId] = {}
    }
    enzymeValues[enzymeId][field] = value

    // If setting to not_used, clear penetration
    if (field === 'usageStatus' && value === 'not_used') {
      enzymeValues[enzymeId].penetrationPercent = 0
    }

    updateData({ enzymeValues })
  }

  const getEnzymeValue = (enzymeId: string, field: string) => {
    return data.enzymeValues?.[enzymeId]?.[field]
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Step 5: Enzyme Penetration
        </h2>
        <p className="text-gray-600 mb-6">
          For each enzyme category, indicate if it's used and enter penetration percentage.
        </p>
      </div>

      <div className="space-y-4">
        {enzymeCategories.map((enzyme) => {
          const usageStatus = getEnzymeValue(enzyme.id, 'usageStatus')
          const penetration = getEnzymeValue(enzyme.id, 'penetrationPercent')

          return (
            <div
              key={enzyme.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{enzyme.name}</h4>
                  {enzyme.productReference && (
                    <p className="text-xs text-gray-500 mt-1">
                      Example: {enzyme.productReference}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                  #{enzyme.sortOrder}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Status
                  </label>
                  <select
                    value={usageStatus || 'unknown'}
                    onChange={(e) =>
                      handleEnzymeChange(enzyme.id, 'usageStatus', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="used">Used</option>
                    <option value="not_used">Not Used</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penetration % {usageStatus === 'used' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    value={penetration !== null && penetration !== undefined ? penetration : ''}
                    onChange={(e) =>
                      handleEnzymeChange(
                        enzyme.id,
                        'penetrationPercent',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    disabled={usageStatus === 'not_used'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={usageStatus === 'not_used' ? 'N/A' : 'Enter % or leave blank'}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    % of beer volume produced using this enzyme category
                  </p>
                </div>
              </div>

              {usageStatus === 'used' && penetration > 0 && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  ✓ Will require market share data in next step
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>0 vs Blank distinction:</strong> Enter 0 for confirmed zero usage.
          Leave blank if unknown. These are tracked separately.
        </p>
      </div>
    </div>
  )
}
