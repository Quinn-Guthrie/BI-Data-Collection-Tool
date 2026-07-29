import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FilteredEntriesSection from '@/components/dashboard/FilteredEntriesSection'
import ActivityLog from '@/components/dashboard/ActivityLog'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import StatsSection from '@/components/dashboard/StatsSection'
import ChartsSection from '@/components/dashboard/ChartsSection'

async function getStats(userId: string, role: string) {
  const where =
    role === 'super_admin' || role === 'admin' || role === 'approver'
      ? {} // See all entries
      : { accountManagerUserId: userId } // Only own entries

  const [total, notStarted, inProgress, finalized, pendingApproval] =
    await Promise.all([
      prisma.entry.count({ where }),
      prisma.entry.count({
        where: { ...where, status: 'not_started' },
      }),
      prisma.entry.count({
        where: { ...where, status: { in: ['draft', 'carried_over_unconfirmed'] } },
      }),
      prisma.entry.count({
        where: { ...where, status: 'finalized' },
      }),
      prisma.entry.count({
        where: { ...where, approvalStatus: 'submitted' },
      }),
    ])

  return { total, notStarted, inProgress, finalized, pendingApproval }
}

async function getEntries(userId: string, role: string) {
  const where =
    role === 'super_admin' || role === 'admin' || role === 'approver'
      ? {}
      : { accountManagerUserId: userId }

  return prisma.entry.findMany({
    where,
    include: {
      company: true,
      country: true,
      segment: true,
      cycle: true,
      plant: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })
}

async function getChartData(userId: string, role: string) {
  const where =
    role === 'super_admin' || role === 'admin' || role === 'approver'
      ? {}
      : { accountManagerUserId: userId }

  // Get entries by segment
  const entriesBySegment = await prisma.entry.groupBy({
    by: ['businessSegmentId'],
    where,
    _count: { id: true },
  })

  const segments = await prisma.businessSegment.findMany()
  const segmentData = await Promise.all(
    entriesBySegment.map(async (item) => {
      const segment = segments.find((s) => s.id === item.businessSegmentId)
      return {
        name: segment?.name || 'Unknown',
        value: item._count.id,
        color: segment?.color || '#gray',
      }
    })
  )

  // Get entries by status
  const entriesByStatus = await prisma.entry.groupBy({
    by: ['status'],
    where,
    _count: { id: true },
  })

  const statusColors: Record<string, string> = {
    not_started: '#9ca3af',
    draft: '#f59e0b',
    carried_over_unconfirmed: '#3b82f6',
    finalized: '#10b981',
  }

  const statusLabels: Record<string, string> = {
    not_started: 'Not Started',
    draft: 'Draft',
    carried_over_unconfirmed: 'Needs Confirmation',
    finalized: 'Finalized',
  }

  const statusData = entriesByStatus.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item._count.id,
    color: statusColors[item.status] || '#gray',
  }))

  // Get top users
  const topUsers = await prisma.entry.groupBy({
    by: ['accountManagerUserId'],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const users = await prisma.user.findMany({
    where: { id: { in: topUsers.map((u) => u.accountManagerUserId) } },
  })

  const topUsersData = topUsers.map((item) => {
    const user = users.find((u) => u.id === item.accountManagerUserId)
    return {
      name: user?.name || 'Unknown',
      entries: item._count.id,
    }
  })

  // Get confidence distribution
  const allEntries = await prisma.entry.findMany({
    where,
    select: { confidencePercent: true },
  })

  const confidenceRanges = [
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 },
  ]

  allEntries.forEach((entry) => {
    const conf = entry.confidencePercent || 0
    if (conf <= 20) confidenceRanges[0].count++
    else if (conf <= 40) confidenceRanges[1].count++
    else if (conf <= 60) confidenceRanges[2].count++
    else if (conf <= 80) confidenceRanges[3].count++
    else confidenceRanges[4].count++
  })

  // Get completion trend (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const completionTrend = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    const completed = await prisma.entry.count({
      where: {
        ...where,
        status: 'finalized',
        finalizedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const drafted = await prisma.entry.count({
      where: {
        ...where,
        status: 'draft',
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    completionTrend.push({ date: dateStr, completed, drafted })
  }

  return {
    entriesBySegment: segmentData,
    entriesByStatus: statusData,
    topUsers: topUsersData,
    confidenceDistribution: confidenceRanges,
    completionTrend,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const stats = await getStats(session.user.id, session.user.role)
  const entries = await getEntries(session.user.id, session.user.role)
  const chartData = await getChartData(session.user.id, session.user.role)

  // Get open cycles for user's segments
  let openCycles
  if (session.user.role === 'super_admin') {
    openCycles = await prisma.cycle.findMany({
      where: { status: 'open' },
      include: { segment: true },
    })
  } else {
    const userSegments = await prisma.userSegment.findMany({
      where: { userId: session.user.id },
      select: { segmentId: true },
    })
    const segmentIds = userSegments.map(us => us.segmentId)

    openCycles = await prisma.cycle.findMany({
      where: {
        status: 'open',
        segmentId: { in: segmentIds },
      },
      include: { segment: true },
    })
  }

  return (
    <div className="space-y-6">
      {/* Active Cycles */}
      <div
        className="card"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Active Cycles
        </h2>
        {openCycles.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No active cycles</p>
        ) : (
          <div className="space-y-2">
            {openCycles.map(cycle => (
              <div
                key={cycle.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cycle.segment.color }}
                  />
                  <div>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {cycle.segment.name}:
                    </span>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {cycle.name}
                    </span>
                  </div>
                </div>
                <span className="badge badge-success">Open</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Old Stats - Remove this entire section */}
      <div className="hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Records */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Records</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
              <p className="text-blue-100 text-xs mt-1">All entries</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Not Started */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 transform transition-all hover:scale-105 hover:shadow-xl hover:border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Not Started</p>
              <p className="text-4xl font-bold text-gray-700 mt-2">{stats.notStarted}</p>
              {stats.total > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  {Math.round((stats.notStarted / stats.total) * 100)}% of total
                </p>
              )}
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium uppercase tracking-wide">In Progress</p>
              <p className="text-4xl font-bold mt-2">{stats.inProgress}</p>
              {stats.total > 0 && (
                <p className="text-yellow-100 text-xs mt-1">
                  {Math.round((stats.inProgress / stats.total) * 100)}% of total
                </p>
              )}
            </div>
            <div className="bg-yellow-300 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Finalized */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Finalized</p>
              <p className="text-4xl font-bold mt-2">{stats.finalized}</p>
              {stats.total > 0 && (
                <p className="text-green-100 text-xs mt-1">
                  {Math.round((stats.finalized / stats.total) * 100)}% complete
                </p>
              )}
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Pending Approval</p>
              <p className="text-4xl font-bold mt-2">{stats.pendingApproval}</p>
              {stats.finalized > 0 && (
                <p className="text-purple-100 text-xs mt-1">
                  {Math.round((stats.pendingApproval / stats.finalized) * 100)}% of finalized
                </p>
              )}
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/entries/new" className="btn btn-primary btn-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Entry
        </Link>
        {session.user.role === 'super_admin' && (
          <Link href="/dashboard/admin" className="btn btn-secondary btn-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Analytics Charts */}
      <ChartsSection data={chartData} />

      {/* Filtered Entries Section */}
      <FilteredEntriesSection initialEntries={entries} />

      {/* Recent Activity */}
      <div
        className="card"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Your Recent Activity
        </h2>
        <ActivityLog limit={10} />
      </div>
    </div>
  )
}
