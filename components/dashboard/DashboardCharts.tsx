'use client'

import { useEffect, useState } from 'react'

type ChartData = {
  byStatus: { status: string; count: number; percentage: number }[]
  byCountry: { country: string; count: number }[]
  byApproval: { approval: string; count: number; percentage: number }[]
  confidenceDistribution: { range: string; count: number }[]
  totalEntries: number
}

export default function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/charts')
      .then(r => r.json())
      .then(chartData => {
        setData(chartData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-48 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500'
      case 'finalized': return 'bg-green-500'
      case 'needs_correction': return 'bg-red-500'
      case 'locked': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const getApprovalColor = (approval: string) => {
    switch (approval) {
      case 'approved': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'submitted': return 'bg-blue-500'
      case 'pending': return 'bg-gray-400'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Entries by Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Entries by Status</h3>
        <div className="space-y-3">
          {data.byStatus.map((item) => (
            <div key={item.status}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 capitalize">{item.status.replace(/_/g, ' ')}</span>
                <span className="font-semibold text-gray-900">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStatusColor(item.status)}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entries by Approval Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h3>
        <div className="space-y-3">
          {data.byApproval.map((item) => (
            <div key={item.approval}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 capitalize">{item.approval}</span>
                <span className="font-semibold text-gray-900">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getApprovalColor(item.approval)}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
        <div className="space-y-3">
          {data.byCountry.slice(0, 5).map((item, idx) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-300">#{idx + 1}</span>
                <span className="text-sm text-gray-700">{item.country}</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Distribution</h3>
        <div className="space-y-3">
          {data.confidenceDistribution.map((item) => {
            const percentage = data.totalEntries > 0 ? (item.count / data.totalEntries * 100).toFixed(1) : 0
            const color =
              item.range.includes('80-100') ? 'bg-green-500' :
              item.range.includes('50-79') ? 'bg-yellow-500' :
              'bg-red-500'

            return (
              <div key={item.range}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.range}</span>
                  <span className="font-semibold text-gray-900">{item.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
