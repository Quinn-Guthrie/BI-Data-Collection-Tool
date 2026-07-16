import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import EntriesTable from '@/components/dashboard/EntriesTable'
import ActivityLog from '@/components/dashboard/ActivityLog'

async function getStats(userId: string, role: string) {
  const where =
    role === 'admin' || role === 'approver'
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
    role === 'admin' || role === 'approver'
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
  const currentCycle = await prisma.cycle.findFirst({
    where: { status: 'open' },
  })

  return (
    <div className="space-y-6">
      {/* Cycle Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              Current Cycle: {currentCycle?.name || 'No active cycle'}
            </h2>
            <p className="text-sm text-blue-700">
              Opened {currentCycle?.openedAt && new Date(currentCycle.openedAt).toLocaleDateString()}
            </p>
          </div>
          {currentCycle && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Open
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Records</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Not Started</p>
          <p className="text-3xl font-bold text-gray-500 mt-2">
            {stats.notStarted}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Finalized</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.finalized}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Pending Approval</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats.pendingApproval}
          </p>
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
        {(session.user.role === 'admin' || session.user.role === 'approver') && (
          <Link
            href="/dashboard/admin"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Entries
          </h2>
        </div>
        <EntriesTable entries={entries} />
      </div>

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
