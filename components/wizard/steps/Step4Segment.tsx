'use client'

import { useState, useEffect } from 'react'

export default function Step4Segment({ data, updateData }: any) {
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lookups/segments')
      .then(r => r.json())
      .then(segmentsData => {
        setSegments(Array.isArray(segmentsData) ? segmentsData : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading segments:', error)
        setSegments([])
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
          Step 4: Segment Details
        </h2>
        <p className="text-gray-600 mb-6">
          Select the beer segment and production percentage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment <span className="text-red-500">*</span>
          </label>
          <select
            value={data.segmentId || ''}
            onChange={(e) => updateData({ segmentId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select segment...</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
          {data.segmentId && (
            <p className="text-xs text-gray-600 mt-2">
              {segments.find(s => s.id === data.segmentId)?.definition}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Production % for this Segment
          </label>
          <input
            type="number"
            value={data.productionPercent || ''}
            onChange={(e) => updateData({ productionPercent: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter percentage (or leave blank if unknown)"
            min="0"
            max="100"
            step="0.1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the percentage of this company's beer production in this country that belongs to this segment (0-100).
          </p>
          <p className="text-xs text-gray-500">
            Note: Production % across all segments for same company/country should ideally total 100%.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 font-medium mb-2">
          Segment Definitions:
        </p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li><strong>Normal beer:</strong> Standard beer</li>
          <li><strong>Light beer:</strong> RDF above 75%</li>
          <li><strong>Adjunct beer:</strong> 30 to 50% adjuncts</li>
        </ul>
      </div>

      {data.segmentId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Segment selected. Continue to enzyme data entry.
          </p>
        </div>
      )}
    </div>
  )
}
