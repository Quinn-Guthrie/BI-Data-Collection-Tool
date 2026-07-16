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

  const getStatusDistribution = () => {
    if (stats.total === 0) return []
    return [
      { label: 'Not Started', value: stats.notStarted, color: 'bg-slate-400' },
      { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-400' },
      { label: 'Finalized', value: stats.finalized, color: 'bg-emerald-500' },
    ]
  }

  const distribution = getStatusDistribution()

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Records */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Total Records</p>
          <p className="text-4xl font-semibold text-slate-900 mb-4">{stats.total}</p>
          <div className="h-16 flex items-end space-x-1">
            {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
              <div key={i} className="flex-1 bg-slate-200 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">In Progress</p>
          <p className="text-4xl font-semibold text-slate-900 mb-1">{stats.inProgress}</p>
          <p className="text-sm text-slate-500 mb-3">
            {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Finalized */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Finalized</p>
          <p className="text-4xl font-semibold text-slate-900 mb-1">{stats.finalized}</p>
          <p className="text-sm text-slate-500 mb-3">
            {stats.total > 0 ? Math.round((stats.finalized / stats.total) * 100) : 0}% complete
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${getCompletionRate()}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Pending Approval</p>
          <p className="text-4xl font-semibold text-slate-900 mb-1">{stats.pendingApproval}</p>
          <p className="text-sm text-slate-500 mb-3">
            {stats.finalized > 0 ? Math.round((stats.pendingApproval / stats.finalized) * 100) : 0}% awaiting
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all"
              style={{ width: `${stats.finalized > 0 ? (stats.pendingApproval / stats.finalized) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Visual */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Status Distribution</h3>
          {stats.total > 0 ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      let offset = 0
                      const radius = 40
                      const circumference = 2 * Math.PI * radius

                      return distribution.map((item, i) => {
                        const percentage = (item.value / stats.total) * 100
                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                        const strokeDashoffset = -offset * circumference / 100
                        offset += percentage

                        const colors = ['#94a3b8', '#fbbf24', '#10b981']

                        return (
                          <circle
                            key={i}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={colors[i]}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all"
                          />
                        )
                      })
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{getCompletionRate()}%</div>
                      <div className="text-xs text-slate-500">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {distribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                      <span className="text-slate-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {item.value} ({Math.round((item.value / stats.total) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-12">No data available</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Entry Status Breakdown</h3>
          {stats.total > 0 ? (
            <div className="space-y-4">
              {[
                { label: 'Not Started', value: stats.notStarted, color: 'bg-slate-400' },
                { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-400' },
                { label: 'Finalized', value: stats.finalized, color: 'bg-emerald-500' },
                { label: 'Pending Approval', value: stats.pendingApproval, color: 'bg-blue-400' },
              ].map((item, i) => {
                const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                    <div className="relative w-full bg-slate-100 rounded-full h-8 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 15 && (
                          <span className="text-xs font-semibold text-white">
                            {Math.round(percentage)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}
