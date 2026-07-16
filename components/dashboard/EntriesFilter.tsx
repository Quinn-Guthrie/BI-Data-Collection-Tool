'use client'

import { useState, useEffect } from 'react'

type FilterProps = {
  onFilterChange: (filters: any) => void
}

export default function EntriesFilter({ onFilterChange }: FilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])

  const [filters, setFilters] = useState({
    status: '',
    approvalStatus: '',
    companyId: '',
    countryId: '',
    segmentId: '',
    confidenceMin: '',
    confidenceMax: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  })

  useEffect(() => {
    // Load lookup data
    Promise.all([
      fetch('/api/lookups/companies').then(r => r.json()),
      fetch('/api/lookups/countries').then(r => r.json()),
      fetch('/api/lookups/segments').then(r => r.json()),
    ]).then(([companiesData, countriesData, segmentsData]) => {
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setCountries(Array.isArray(countriesData) ? countriesData : [])
      setSegments(Array.isArray(segmentsData) ? segmentsData : [])
    })
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      status: '',
      approvalStatus: '',
      companyId: '',
      countryId: '',
      segmentId: '',
      confidenceMin: '',
      confidenceMax: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search entries..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="needs_correction">Needs Correction</option>
              <option value="finalized">Finalized</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Approvals</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Company
            </label>
            <select
              value={filters.companyId}
              onChange={(e) => handleFilterChange('companyId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={filters.countryId}
              onChange={(e) => handleFilterChange('countryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.countryName}
                </option>
              ))}
            </select>
          </div>

          {/* Segment Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Segment
            </label>
            <select
              value={filters.segmentId}
              onChange={(e) => handleFilterChange('segmentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Segments</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confidence Min %
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.confidenceMin}
              onChange={(e) => handleFilterChange('confidenceMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confidence Max %
            </label>
            <input
              type="number"
              placeholder="100"
              value={filters.confidenceMax}
              onChange={(e) => handleFilterChange('confidenceMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
