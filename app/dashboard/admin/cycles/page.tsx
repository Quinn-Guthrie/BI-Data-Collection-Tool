'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Cycle = {
  id: string
  name: string
  status: string
  createdAt: string
  lockedAt: string | null
  _count: {
    entries: number
  }
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCarryForwardModal, setShowCarryForwardModal] = useState(false)
  const [newCycleName, setNewCycleName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadCycles()
  }, [])

  const loadCycles = async () => {
    try {
      const res = await fetch('/api/admin/cycles')
      if (res.ok) {
        const data = await res.json()
        setCycles(data)
      }
    } catch (err) {
      console.error('Failed to load cycles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const res = await fetch('/api/admin/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCycleName }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Cycle created successfully!')
        setShowModal(false)
        setNewCycleName('')
        loadCycles()

        // Ask if they want to carry forward
        const lockedCycles = cycles.filter(c => c.status === 'locked')
        if (lockedCycles.length > 0) {
          setShowCarryForwardModal(true)
        }
      } else {
        setError(data.error || 'Failed to create cycle')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCarryForward = async () => {
    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const targetCycle = cycles.find(c => c.status === 'open')
      if (!targetCycle) {
        setError('No open cycle found')
        setProcessing(false)
        return
      }

      // Call carry-forward on the NEW cycle (not the old one)
      const res = await fetch(`/api/admin/cycles/${targetCycle.id}/carry-forward`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(`Successfully carried forward ${data.clonedCount} entries from "${data.fromCycle}"!`)
        setShowCarryForwardModal(false)
        loadCycles()
      } else {
        setError(data.error || 'Failed to carry forward entries')
      }
    } catch (err) {
      setError('An error occurred during carry-forward.')
    } finally {
      setProcessing(false)
    }
  }

  const handleLockCycle = async (cycleId: string) => {
    if (!confirm('Are you sure you want to lock this cycle? This action cannot be undone.')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/cycles/${cycleId}/lock`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Cycle locked successfully!')
        loadCycles()
      } else {
        setError(data.error || 'Failed to lock cycle')
      }
    } catch (err) {
      setError('An error occurred.')
    }
  }

  const openCycle = cycles.find(c => c.status === 'open')
  const lockedCycles = cycles.filter(c => c.status === 'locked')

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cycle Management</h1>
          <p className="text-gray-600 mt-2">Manage data collection cycles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!!openCycle}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Create New Cycle
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Cycle */}
      {openCycle && (
        <div className="bg-white rounded-lg border-2 border-green-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900">{openCycle.name}</h2>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  ● Active
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Created: {new Date(openCycle.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Entries: {openCycle._count.entries}
              </p>
            </div>
            <button
              onClick={() => handleLockCycle(openCycle.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Lock Cycle
            </button>
          </div>
        </div>
      )}

      {/* Warning if no active cycle */}
      {!openCycle && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <strong>No active cycle!</strong> Create a new cycle to allow users to enter data.
        </div>
      )}

      {/* Locked Cycles */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Locked Cycles</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {lockedCycles.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No locked cycles yet
            </div>
          ) : (
            lockedCycles.map((cycle) => (
              <div key={cycle.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{cycle.name}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Locked
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(cycle.createdAt).toLocaleDateString()} |
                      Locked: {cycle.lockedAt ? new Date(cycle.lockedAt).toLocaleDateString() : 'N/A'} |
                      Entries: {cycle._count.entries}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Cycle</h2>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle Name
                </label>
                <input
                  type="text"
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                  required
                  placeholder="e.g. 2026 Annual Data Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Cycle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setError('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carry Forward Modal */}
      {showCarryForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Carry Forward Data?</h2>
            <p className="text-gray-600 mb-4">
              This will copy all finalized entries from the most recent locked cycle in this segment.
              Users will need to confirm each value before finalizing.
            </p>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-4">
              <strong>Note:</strong> The system will automatically find and copy from the most recent locked cycle.
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleCarryForward}
                disabled={processing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Carry Forward'}
              </button>
              <button
                onClick={() => {
                  setShowCarryForwardModal(false)
                  setError('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
