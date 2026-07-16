'use client'

import { useState, useEffect } from 'react'

export default function Step2Plant({ data, updateData }: any) {
  const [plants, setPlants] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lookups/plants').then(r => r.json()),
      fetch('/api/lookups/countries').then(r => r.json()),
    ]).then(([plantsData, countriesData]) => {
      setPlants(Array.isArray(plantsData) ? plantsData : [])
      setCountries(Array.isArray(countriesData) ? countriesData : [])
      setLoading(false)
    }).catch((error) => {
      console.error('Error loading data:', error)
      setPlants([])
      setCountries([])
      setLoading(false)
    })
  }, [])

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id === countryId)
    if (country) {
      updateData({
        countryId,
        region: country.region,
        subregion: country.subregion,
        plantId: null, // Reset plant when country changes
      })
    }
  }

  const filteredPlants = data.countryId
    ? plants.filter(p => p.countryId === data.countryId)
    : plants

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Step 2: Plant & Location
        </h2>
        <p className="text-gray-600 mb-6">
          Select the country and plant for this entry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={data.countryId || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select country...</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.countryName}
              </option>
            ))}
          </select>
        </div>

        {data.countryId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                value={data.region || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from country</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subregion
              </label>
              <input
                type="text"
                value={data.subregion || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from country</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant (Optional)
              </label>
              <select
                value={data.plantId || ''}
                onChange={(e) => updateData({ plantId: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No specific plant</option>
                {filteredPlants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name} ({plant.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a specific plant or leave blank for company-level entry
              </p>
            </div>
          </>
        )}
      </div>

      {data.countryId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-green-800">
            ✓ Hierarchy: {data.plantId ? 'Plant → ' : ''}Company → Country ({data.countryId}) → Subregion ({data.subregion}) → Region ({data.region})
          </p>
        </div>
      )}
    </div>
  )
}
