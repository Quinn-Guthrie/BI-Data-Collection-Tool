'use client'

import { useState, useEffect } from 'react'
import EntriesFilter from './EntriesFilter'
import EntriesTable from './EntriesTable'

export default function FilteredEntriesSection({ initialEntries }: { initialEntries: any[] }) {
  const [entries, setEntries] = useState(initialEntries)
  const [filteredEntries, setFilteredEntries] = useState(initialEntries)
  const [loading, setLoading] = useState(false)

  const handleFilterChange = (filters: any) => {
    let filtered = [...entries]

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status)
    }

    // Apply approval status filter
    if (filters.approvalStatus) {
      filtered = filtered.filter(e => e.approvalStatus === filters.approvalStatus)
    }

    // Apply company filter
    if (filters.companyId) {
      filtered = filtered.filter(e => e.companyId === filters.companyId)
    }

    // Apply country filter
    if (filters.countryId) {
      filtered = filtered.filter(e => e.countryId === filters.countryId)
    }

    // Apply segment filter
    if (filters.segmentId) {
      filtered = filtered.filter(e => e.segmentId === filters.segmentId)
    }

    // Apply confidence range filter
    if (filters.confidenceMin) {
      const min = parseFloat(filters.confidenceMin)
      filtered = filtered.filter(e => (e.confidencePercent || 0) >= min)
    }

    if (filters.confidenceMax) {
      const max = parseFloat(filters.confidenceMax)
      filtered = filtered.filter(e => (e.confidencePercent || 0) <= max)
    }

    // Apply date range filter
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.updatedAt)
        return entryDate >= from
      })
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.updatedAt)
        return entryDate <= to
      })
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(e =>
        e.company.name.toLowerCase().includes(searchLower) ||
        e.country.countryName.toLowerCase().includes(searchLower) ||
        e.segment.name.toLowerCase().includes(searchLower) ||
        (e.plant?.name || '').toLowerCase().includes(searchLower) ||
        (e.comments || '').toLowerCase().includes(searchLower)
      )
    }

    setFilteredEntries(filtered)
  }

  return (
    <div className="space-y-4">
      <EntriesFilter onFilterChange={handleFilterChange} />
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Entries
          </h2>
          <span className="text-sm text-gray-600">
            Showing {filteredEntries.length} of {entries.length} entries
          </span>
        </div>
        <EntriesTable entries={filteredEntries} />
      </div>
    </div>
  )
}
