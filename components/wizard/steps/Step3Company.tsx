'use client'

import { useState, useEffect } from 'react'

export default function Step3Company({ data, updateData }: any) {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lookups/companies')
      .then(r => r.json())
      .then(companiesData => {
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading companies:', error)
        setCompanies([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Step 3: Company Details
        </h2>
        <p className="text-gray-600 mb-6">
          Enter company information and production details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <select
            value={data.companyId || ''}
            onChange={(e) => updateData({ companyId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select company...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Customer? <span className="text-red-500">*</span>
          </label>
          <select
            value={data.existingCustomer || ''}
            onChange={(e) => updateData({ existingCustomer: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Go-to-Market <span className="text-red-500">*</span>
          </label>
          <select
            value={data.goToMarket || ''}
            onChange={(e) => updateData({ goToMarket: e.target.value, distributorId: e.target.value === 'direct' ? null : data.distributorId })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select...</option>
            <option value="direct">Direct</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>

        {data.goToMarket === 'distributor' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distributor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.distributorName || ''}
              onChange={(e) => updateData({ distributorName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter distributor name"
              required
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Production Beer HL/Year
          </label>
          <input
            type="number"
            value={data.productionBeerHlYear || ''}
            onChange={(e) => updateData({ productionBeerHlYear: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter production volume (or leave blank if unknown)"
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter total beer production in hectoliters per year. Leave blank if unknown (0 vs blank distinction).
          </p>
        </div>
      </div>

      {data.companyId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            ✓ Company selected. Production data can be blank (unknown) or 0 (confirmed zero) - they are distinct values.
          </p>
        </div>
      )}
    </div>
  )
}
