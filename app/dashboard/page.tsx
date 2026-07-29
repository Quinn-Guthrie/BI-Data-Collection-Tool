import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FilteredEntriesSection from '@/components/dashboard/FilteredEntriesSection'
import ActivityLog from '@/components/dashboard/ActivityLog'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import StatsSection from '@/components/dashboard/StatsSection'
import ChartsSection from '@/components/dashboard/ChartsSection'
import Collapsible from '@/components/ui/Collapsible'

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
      <Collapsible title="Active Cycles" defaultOpen={true}>
        {openCycles.length === 0 ? (
          <p style={{ color: '#B0BCD3' }}>No active cycles</p>
        ) : (
          <div className="space-y-3">
            {openCycles.map(cycle => (
              <div
                key={cycle.id}
                className="flex items-center justify-between rounded-2xl p-4 transition-all hover:bg-white/5"
                style={{
                  background: 'rgba(27, 38, 66, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: cycle.segment.color,
                      boxShadow: `0 0 8px ${cycle.segment.color}`,
                    }}
                  />
                  <div>
                    <span className="font-semibold" style={{ color: '#D9E2F0' }}>
                      {cycle.segment.name}
                    </span>
                    <span style={{ color: '#6B7A94' }}> • {cycle.name}</span>
                  </div>
                </div>
                <span className="badge-success">Open</span>
              </div>
            ))}
          </div>
        )}
      </Collapsible>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/entries/new" className="btn-default btn-lg">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Entry
        </Link>
        {session.user.role === 'super_admin' && (
          <Link href="/dashboard/admin" className="btn-secondary btn-lg">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <Collapsible title="Your Recent Activity" defaultOpen={false}>
        <ActivityLog limit={10} />
      </Collapsible>
    </div>
  )
}
