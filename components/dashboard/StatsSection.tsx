'use client'

type StatsProps = {
  stats: {
    total: number
    notStarted: number
    inProgress: number
    finalized: number
    pendingApproval: number
  }
}

export default function StatsSection({ stats }: StatsProps) {
  const getCompletionRate = () => {
    if (stats.total === 0) return 0
    return Math.round((stats.finalized / stats.total) * 100)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>

        {/* Not Started */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Not Started</p>
          <p className="text-3xl font-bold text-slate-600">{stats.notStarted}</p>
        </div>

        {/* In Progress */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">In Progress</p>
          <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
        </div>

        {/* Finalized */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Finalized</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.finalized}</p>
          <p className="text-xs text-slate-500 mt-1">{getCompletionRate()}%</p>
        </div>

        {/* Pending Approval */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-3xl font-bold text-blue-600">{stats.pendingApproval}</p>
        </div>
      </div>
    </div>
  )
}
