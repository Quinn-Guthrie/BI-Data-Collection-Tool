'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ChartData {
  entriesBySegment: Array<{ name: string; value: number; color: string }>
  entriesByStatus: Array<{ name: string; value: number; color: string }>
  topUsers: Array<{ name: string; entries: number }>
  confidenceDistribution: Array<{ range: string; count: number }>
  completionTrend: Array<{ date: string; completed: number; drafted: number }>
}

export default function ChartsSection({ data }: { data: ChartData }) {
  const [colors, setColors] = useState({
    text: '#1E293B',
    grid: '#E2E8F0',
    primary: '#0075CF',
    success: '#10B981',
    warning: '#F59E0B',
  })

  useEffect(() => {
    // Get computed colors from CSS variables
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    setColors({
      text: computedStyle.getPropertyValue('--color-text-primary').trim(),
      grid: computedStyle.getPropertyValue('--color-border').trim(),
      primary: computedStyle.getPropertyValue('--color-primary').trim(),
      success: computedStyle.getPropertyValue('--color-success').trim(),
      warning: computedStyle.getPropertyValue('--color-warning').trim(),
    })

    // Update on theme change
    const observer = new MutationObserver(() => {
      const newStyle = getComputedStyle(root)
      setColors({
        text: newStyle.getPropertyValue('--color-text-primary').trim(),
        grid: newStyle.getPropertyValue('--color-border').trim(),
        primary: newStyle.getPropertyValue('--color-primary').trim(),
        success: newStyle.getPropertyValue('--color-success').trim(),
        warning: newStyle.getPropertyValue('--color-warning').trim(),
      })
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="card card-compact"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <strong>{entry.name}:</strong> {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entries by Segment */}
        <div
          className="card"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Entries by Business Segment
          </h3>
          {data.entriesBySegment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.entriesBySegment}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {data.entriesBySegment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: colors.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-[300px] flex items-center justify-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No data available
            </div>
          )}
        </div>

        {/* Entries by Status */}
        <div
          className="card"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Entries by Status
          </h3>
          {data.entriesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.entriesByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {data.entriesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: colors.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-[300px] flex items-center justify-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Middle Row - Bar Chart */}
      <div
        className="card"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Top Contributors
        </h3>
        {data.topUsers.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" stroke={colors.text} />
              <YAxis stroke={colors.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  color: colors.text,
                }}
              />
              <Bar dataKey="entries" fill={colors.primary} name="Entries Created" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="h-[300px] flex items-center justify-center"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No data available
          </div>
        )}
      </div>

      {/* Bottom Row - Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <div
          className="card"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Confidence Distribution
          </h3>
          {data.confidenceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="range" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: colors.text,
                  }}
                />
                <Bar dataKey="count" fill={colors.success} name="Number of Entries" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-[300px] flex items-center justify-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No data available
            </div>
          )}
        </div>

        {/* Completion Trend */}
        <div
          className="card"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Completion Trend (Last 7 Days)
          </h3>
          {data.completionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="date" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: colors.text,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={colors.success}
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="drafted"
                  stroke={colors.warning}
                  strokeWidth={2}
                  name="Drafted"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-[300px] flex items-center justify-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
