import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FilteredEntriesSection from '@/components/dashboard/FilteredEntriesSection'
import ActivityLog from '@/components/dashboard/ActivityLog'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import StatsSection from '@/components/dashboard/StatsSection'

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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const stats = await getStats(session.user.id, session.user.role)
  const entries = await getEntries(session.user.id, session.user.role)

  // Get open cycles for user's segments
  let openCycles
  if (session.user.role === 'super_admin') {
    openCycles = await prisma.cycle.findMany({
      where: { status: 'open' },
      include: { businessSegment: true },
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
        businessSegmentId: { in: segmentIds },
      },
      include: { businessSegment: true },
    })
  }

  return (
    <div className="space-y-6">
      {/* Cycle Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div>
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Active Cycles
          </h2>
          {openCycles.length === 0 ? (
            <p className="text-sm text-blue-700">No active cycles</p>
          ) : (
            <div className="space-y-2">
              {openCycles.map(cycle => (
                <div key={cycle.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cycle.businessSegment.color }}
                    />
                    <div>
                      <span className="font-medium text-blue-900">{cycle.businessSegment.name}:</span>{' '}
                      <span className="text-blue-800">{cycle.name}</span>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Open
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
        <Link
          href="/dashboard/entries/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Add New Entry
        </Link>
        {(session.user.role === 'super_admin' || session.user.role === 'admin' || session.user.role === 'approver') && (
          <Link
            href="/dashboard/admin"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium shadow-md"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Filtered Entries Section */}
      <FilteredEntriesSection initialEntries={entries} />

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <ActivityLog limit={10} />
        </div>
      </div>
    </div>
  )
}
