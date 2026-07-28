'use client'

import { useState, useEffect } from 'react'

interface Cycle {
  id: string
  name: string
  segment: {
    id: string
    name: string
    color: string
  }
}

export default function Step0CycleSelection({
  selectedCycleId,
  selectedBusinessSegmentId,
  onSelect,
  onNext,
}: {
  selectedCycleId?: string
  selectedBusinessSegmentId?: string
  onSelect: (cycleId: string, businessSegmentId: string) => void
  onNext: () => void
}) {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cycles/current')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCycles(data)
          // Auto-select if only one cycle
          if (data.length === 1) {
            onSelect(data[0].id, data[0].segment.id)
          }
        } else {
          setError('No active cycles found')
        }
      })
      .catch(() => setError('Failed to load cycles'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (cycle: Cycle) => {
    onSelect(cycle.id, cycle.segment.id)
  }

  const handleContinue = () => {
    if (!selectedCycleId || !selectedBusinessSegmentId) {
      setError('Please select a business segment')
      return
    }
    onNext()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (cycles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
        <p className="font-semibold">No Active Cycles</p>
        <p className="text-sm mt-1">
          There are no open cycles available. Please contact your administrator.
        </p>
      </div>
    )
  }

  // Auto-advance if only one cycle
  if (cycles.length === 1 && selectedCycleId) {
    setTimeout(() => onNext(), 100)
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading cycle...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Business Segment
        </h2>
        <p className="text-gray-600">
          Choose which business segment you want to create an entry for.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cycles.map((cycle) => (
          <button
            key={cycle.id}
            onClick={() => handleSelect(cycle)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedCycleId === cycle.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: cycle.segment.color }}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {cycle.segment.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">Cycle: {cycle.name}</p>
            {selectedCycleId === cycle.id && (
              <div className="mt-3">
                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedCycleId}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
