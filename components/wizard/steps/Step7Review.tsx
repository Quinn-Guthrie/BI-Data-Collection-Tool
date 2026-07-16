'use client'

import { useState, useEffect } from 'react'

export default function Step7Review({ data, updateData }: any) {
  const [lookupData, setLookupData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lookups/companies').then(r => r.json()),
      fetch('/api/lookups/countries').then(r => r.json()),
      fetch('/api/lookups/segments').then(r => r.json()),
      fetch('/api/lookups/plants').then(r => r.json()),
      fetch('/api/lookups/enzyme-categories').then(r => r.json()),
    ]).then(([companies, countries, segments, plants, enzymes]) => {
      setLookupData({
        companies: Array.isArray(companies) ? companies : [],
        countries: Array.isArray(countries) ? countries : [],
        segments: Array.isArray(segments) ? segments : [],
        plants: Array.isArray(plants) ? plants : [],
        enzymes: Array.isArray(enzymes) ? enzymes : [],
      })
      setLoading(false)
    }).catch((error) => {
      console.error('Error loading lookup data:', error)
      setLookupData({ companies: [], countries: [], segments: [], plants: [], enzymes: [] })
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const company = lookupData.companies.find((c: any) => c.id === data.companyId)
  const country = lookupData.countries.find((c: any) => c.id === data.countryId)
  const segment = lookupData.segments.find((s: any) => s.id === data.segmentId)
  const plant = data.plantId ? lookupData.plants.find((p: any) => p.id === data.plantId) : null

  const enzymesWithData = lookupData.enzymes.filter((enzyme: any) => {
    const enzymeData = data.enzymeValues?.[enzyme.id]
    return enzymeData && (enzymeData.penetrationPercent > 0 || enzymeData.usageStatus)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Step 7: Review & Finalize
        </h2>
        <p className="text-gray-600 mb-6">
          Review your entry before finalizing. Use Previous to make changes.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Location & Company</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Company:</strong> {company?.name || 'Not selected'}</div>
            <div><strong>Country:</strong> {country?.countryName || 'Not selected'}</div>
            {plant && <div><strong>Plant:</strong> {plant.name} ({plant.code})</div>}
            <div><strong>Region:</strong> {data.region || '-'}</div>
            <div><strong>Subregion:</strong> {data.subregion || '-'}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Business Details</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Existing Customer:</strong> {data.existingCustomer || 'Not selected'}</div>
            <div><strong>Go-to-Market:</strong> {data.goToMarket || 'Not selected'}</div>
            {data.goToMarket === 'distributor' && (
              <div><strong>Distributor:</strong> {data.distributorName || 'Not entered'}</div>
            )}
            <div>
              <strong>Production:</strong>{' '}
              {data.productionBeerHlYear !== null && data.productionBeerHlYear !== undefined
                ? `${data.productionBeerHlYear.toLocaleString()} HL/year`
                : 'Unknown (blank)'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Segment</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Segment:</strong> {segment?.name || 'Not selected'}</div>
            <div>
              <strong>Production %:</strong>{' '}
              {data.productionPercent !== null && data.productionPercent !== undefined
                ? `${data.productionPercent}%`
                : 'Unknown (blank)'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Additional Info</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Confidence:</strong>{' '}
              {data.confidencePercent !== null && data.confidencePercent !== undefined
                ? `${data.confidencePercent}%`
                : 'Not entered'}
            </div>
            <div>
              <strong>Comments:</strong> {data.comments || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Enzyme Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Enzyme Data ({enzymesWithData.length} categories)
        </h3>
        <div className="space-y-3">
          {enzymesWithData.length === 0 ? (
            <p className="text-sm text-gray-500">No enzyme data entered</p>
          ) : (
            enzymesWithData.map((enzyme: any) => {
              const enzymeData = data.enzymeValues[enzyme.id]
              return (
                <div key={enzyme.id} className="border-l-4 border-blue-400 pl-3 py-1">
                  <div className="text-sm font-medium">{enzyme.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Status: {enzymeData.usageStatus || 'unknown'} |
                    Penetration: {enzymeData.penetrationPercent || 0}%
                    {enzymeData.penetrationPercent > 0 && (
                      <span className="ml-2">
                        | Market Share: IFF {enzymeData.iffMarketSharePercent || 0}%,
                        Novonesis {enzymeData.novonesisMarketSharePercent || 0}%,
                        DSM {enzymeData.dsmMarketSharePercent || 0}%,
                        Others {enzymeData.othersMarketSharePercent || 0}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Confidence & Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Final Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence % (0-100) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.confidencePercent || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : Number(e.target.value)
                updateData({ confidencePercent: value })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your confidence level (0-100)"
            />
            <p className="text-xs text-gray-500 mt-1">
              How confident are you in this data? (0 = no confidence, 100 = completely confident)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments / Notes (Optional)
            </label>
            <textarea
              value={data.comments || ''}
              onChange={(e) => updateData({ comments: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any assumptions, missing data, or special notes about this entry..."
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 font-medium">Ready to Finalize?</p>
        <p className="text-xs text-yellow-700 mt-2">
          Click "Finalize Entry" to save this data. The entry will be marked as finalized and
          submitted for approval workflow.
        </p>
      </div>
    </div>
  )
}
