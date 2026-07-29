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
      label: 'Total',
      value: stats.total,
      accent: true,
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
    },
    {
      label: 'Finalized',
      value: stats.finalized,
      subtext: `${getCompletionRate()}% complete`,
    },
    {
      label: 'Pending',
      value: stats.pendingApproval,
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat, index) => (
        <div key={index} className={`card ${stat.accent ? 'card-accent' : ''}`}>
          <div className="p-6">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{
                color: stat.accent ? 'rgba(0, 0, 0, 0.6)' : '#B0BCD3',
              }}
            >
              {stat.label}
            </p>
            <div className="stat-value mb-2">{stat.value}</div>
            {stat.subtext && (
              <p
                className="text-xs font-medium"
                style={{
                  color: stat.accent ? 'rgba(0, 0, 0, 0.5)' : '#6B7A94',
                }}
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
