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
import ChartCard from '@/components/ui/ChartCard'
import { getChartColors, formatNumber } from '@/lib/chart-utils'

interface ChartData {
  entriesBySegment: Array<{ name: string; value: number; color: string }>
  entriesByStatus: Array<{ name: string; value: number; color: string }>
  topUsers: Array<{ name: string; entries: number }>
  confidenceDistribution: Array<{ range: string; count: number }>
  completionTrend: Array<{ date: string; completed: number; drafted: number }>
}

export default function ChartsSection({ data }: { data: ChartData }) {
  const [isDark, setIsDark] = useState(false)
  const [colors, setColors] = useState({
    text: '#1E293B',
    grid: '#E2E8F0',
    primary: '#0075CF',
    success: '#10B981',
    warning: '#F59E0B',
  })

  useEffect(() => {
    const root = document.documentElement
    const theme = root.getAttribute('data-theme')
    setIsDark(theme === 'dark')

    const updateColors = () => {
      const computedStyle = getComputedStyle(root)
      const newTheme = root.getAttribute('data-theme')
      setIsDark(newTheme === 'dark')

      setColors({
        text: computedStyle.getPropertyValue('--foreground').trim(),
        grid: computedStyle.getPropertyValue('--border').trim(),
        primary: computedStyle.getPropertyValue('--primary').trim(),
        success: computedStyle.getPropertyValue('--success').trim(),
        warning: computedStyle.getPropertyValue('--warning').trim(),
      })
    }

    updateColors()

    const observer = new MutationObserver(updateColors)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  const chartColors = getChartColors(isDark)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          {label && (
            <p className="mb-2 text-sm font-semibold">{label}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const EmptyState = () => (
    <div className="flex h-[300px] items-center justify-center">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="mt-2 text-sm text-muted-foreground">No data available</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Top Row - Pie Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entries by Segment */}
        <ChartCard
          title="Entries by Business Segment"
          description="Distribution across segments"
        >
          {data.entriesBySegment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.entriesBySegment}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.entriesBySegment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Entries by Status */}
        <ChartCard
          title="Entries by Status"
          description="Current workflow state"
        >
          {data.entriesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.entriesByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.entriesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {/* Middle Row - Bar Chart */}
      <ChartCard
        title="Top Contributors"
        description="Most active account managers"
      >
        {data.topUsers.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topUsers} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${colors.grid})`} opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke={`hsl(${colors.text})`}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={`hsl(${colors.text})`}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="entries"
                fill={`hsl(${colors.primary})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Entries Created"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      {/* Bottom Row - Two Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Confidence Distribution */}
        <ChartCard
          title="Confidence Distribution"
          description="Data quality confidence levels"
        >
          {data.confidenceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.confidenceDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${colors.grid})`} opacity={0.3} />
                <XAxis
                  dataKey="range"
                  stroke={`hsl(${colors.text})`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={`hsl(${colors.text})`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={`hsl(${colors.success})`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  name="Number of Entries"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Completion Trend */}
        <ChartCard
          title="Completion Trend"
          description="Last 7 days activity"
        >
          {data.completionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.completionTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${colors.grid})`} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke={`hsl(${colors.text})`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={`hsl(${colors.text})`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={`hsl(${colors.success})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="drafted"
                  stroke={`hsl(${colors.warning})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Drafted"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
