'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Cycle = {
  id: string
  name: string
  status: string
  _count: {
    entries: number
  }
}

export default function ExportPage() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [selectedCycle, setSelectedCycle] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadCycles()
  }, [])

  const loadCycles = async () => {
    try {
      const res = await fetch('/api/admin/cycles')
      if (res.ok) {
        const data = await res.json()
        setCycles(data)
        if (data.length > 0) {
          const openCycle = data.find((c: Cycle) => c.status === 'open')
          setSelectedCycle(openCycle?.id || data[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load cycles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!selectedCycle) {
      setError('Please select a cycle')
      return
    }

    setError('')
    setSuccess('')
    setExporting(true)

    try {
      const res = await fetch(`/api/admin/export?cycleId=${selectedCycle}`)

      if (res.ok) {
        // Get the blob from response
        const blob = await res.blob()

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Get filename from Content-Disposition header or use default
        const contentDisposition = res.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `brewing_sales_export_${new Date().toISOString().split('T')[0]}.csv`

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setSuccess('Export completed successfully!')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to export data')
      }
    } catch (err) {
      setError('An error occurred during export.')
    } finally {
      setExporting(false)
    }
  }

  const selectedCycleData = cycles.find(c => c.id === selectedCycle)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Admin Panel
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600 mt-2">Generate CSV exports for analysis</p>
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

      {/* Export Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cycle
            </label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} - {cycle.status} ({cycle._count.entries} entries)
                </option>
              ))}
            </select>
          </div>

          {selectedCycleData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Export Preview</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Cycle:</strong> {selectedCycleData.name}</p>
                <p><strong>Status:</strong> {selectedCycleData.status}</p>
                <p><strong>Total Entries:</strong> {selectedCycleData._count.entries}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Export Format</h3>
            <p className="text-sm text-blue-800">
              CSV file with the following columns:
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Plant, Company, Country, Region, Subregion</li>
              <li>Customer Status, Go-to-Market, Production Volume</li>
              <li>Segment, Production %</li>
              <li>8 Enzyme Categories (Penetration % + Market Share breakdown)</li>
              <li>Confidence %, Comments, Status</li>
              <li>Entry Metadata (Created, Finalized dates, Account Manager)</li>
            </ul>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || !selectedCycle}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Tips</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Open CSV files in Excel, Google Sheets, or any spreadsheet application</p>
          <p>• All finalized and draft entries are included in the export</p>
          <p>• Market share columns show the split between IFF, Novonesis, DSM, and Others</p>
          <p>• Use filters in your spreadsheet to analyze by region, segment, or confidence level</p>
          <p>• Exports include all historical data for the selected cycle</p>
        </div>
      </div>
    </div>
  )
}
