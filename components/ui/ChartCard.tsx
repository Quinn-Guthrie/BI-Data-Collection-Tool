import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
}

export default function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="card-description">{description}</p>
        )}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}
