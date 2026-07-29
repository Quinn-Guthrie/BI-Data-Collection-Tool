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

  const statCards = [
    {
      label: 'Total Entries',
      value: stats.total,
      color: 'var(--color-primary)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
      color: 'var(--color-text-tertiary)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'var(--color-warning)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      label: 'Finalized',
      value: stats.finalized,
      color: 'var(--color-success)',
      subtext: `${getCompletionRate()}% complete`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pending Approval',
      value: stats.pendingApproval,
      color: 'var(--color-info)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="card"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'var(--color-surface)',
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
          </div>

          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {stat.value}
            </p>
            {stat.subtext && (
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {stat.subtext}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
