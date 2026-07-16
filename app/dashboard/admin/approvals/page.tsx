'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Entry = {
  id: string
  company: { name: string }
  country: { countryName: string }
  segment: { name: string }
  plant: { name: string } | null
  accountManager: { name: string; email: string }
  confidencePercent: number | null
  approvalStatus: string
  finalized: boolean
  finalizedAt: string | null
}

export default function ApprovalsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkProcessing, setBulkProcessing] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [filter])

  useEffect(() => {
    // Clear selections when filter changes
    setSelectedIds([])
  }, [filter])

  const loadEntries = async () => {
    try {
      const res = await fetch(`/api/admin/approvals?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (err) {
      console.error('Failed to load entries:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(entries.map(e => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, entryId])
    } else {
      setSelectedIds(selectedIds.filter(id => id !== entryId))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Approve ${selectedIds.length} selected entries?`)) return

    setBulkProcessing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/approvals/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryIds: selectedIds, action: 'approve' }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(data.message)
        setSelectedIds([])
        loadEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to approve entries')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return

    const reason = prompt(`Rejection reason for ${selectedIds.length} entries (will be sent to all account managers):`)
    if (!reason) return

    setBulkProcessing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/approvals/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryIds: selectedIds, action: 'reject', reason }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(data.message)
        setSelectedIds([])
        loadEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reject entries')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleApprove = async (entryId: string) => {
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/approvals/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (res.ok) {
        setSuccess('Entry approved successfully')
        loadEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to approve entry')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleReject = async (entryId: string) => {
    const reason = prompt('Rejection reason (will be sent to account manager):')
    if (!reason) return

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/approvals/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      })

      if (res.ok) {
        setSuccess('Entry rejected successfully')
        loadEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reject entry')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const allSelected = entries.length > 0 && selectedIds.length === entries.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < entries.length

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Admin Panel
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Review & Approve Entries</h1>
        <p className="text-gray-600 mt-2">Review and approve entries submitted by account managers</p>
      </div>

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

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-gray-900 text-xs">
                {entries.length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions Bar */}
      {filter === 'pending' && selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.length} {selectedIds.length === 1 ? 'entry' : 'entries'} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBulkApprove}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              {bulkProcessing ? 'Processing...' : 'Approve Selected'}
            </button>
            <button
              onClick={handleBulkReject}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {bulkProcessing ? 'Processing...' : 'Reject Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {filter} entries found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {filter === 'pending' && (
                  <th className="px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Mgr</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {filter === 'pending' && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry.id)}
                        onChange={(e) => handleSelectOne(entry.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{entry.company.name}</div>
                    {entry.plant && <div className="text-xs text-gray-500">{entry.plant.name}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.country.countryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.segment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entry.accountManager.name}</div>
                    <div className="text-xs text-gray-500">{entry.accountManager.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (entry.confidencePercent || 0) >= 80
                        ? 'bg-green-100 text-green-800'
                        : (entry.confidencePercent || 0) >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.confidencePercent || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.finalizedAt ? new Date(entry.finalizedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {filter === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(entry.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        filter === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {filter}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
