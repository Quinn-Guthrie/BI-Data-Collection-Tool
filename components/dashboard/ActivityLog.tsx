'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Activity = {
  id: string
  entityType: string
  entityId: string
  action: string
  changedBy: string
  changedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  entityDetails?: {
    company: { name: string }
    country: { countryName: string }
    segment: { name: string }
    status: string
    approvalStatus: string
  } | null
}

export default function ActivityLog({ limit = 10 }: { limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/activity?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading activity:', err)
        setLoading(false)
      })
  }, [limit])

  const getActionIcon = (action: string) => {
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center"

    switch (action) {
      case 'created':
        return (
          <div className={`${baseClasses} bg-blue-100`}>
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )
      case 'updated':
        return (
          <div className={`${baseClasses} bg-yellow-100`}>
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )
      case 'finalized':
        return (
          <div className={`${baseClasses} bg-green-100`}>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'approved':
        return (
          <div className={`${baseClasses} bg-green-100`}>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'rejected':
        return (
          <div className={`${baseClasses} bg-red-100`}>
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'submitted':
        return (
          <div className={`${baseClasses} bg-purple-100`}>
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className={`${baseClasses} bg-gray-100`}>
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-blue-600'
      case 'updated':
        return 'text-yellow-600'
      case 'finalized':
        return 'text-green-600'
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'submitted':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const getActivityDescription = (activity: Activity) => {
    const { action, entityType, entityDetails, user } = activity

    if (entityType === 'Entry' && entityDetails) {
      const entryName = `${entityDetails.company.name} - ${entityDetails.country.countryName} - ${entityDetails.segment.name}`

      switch (action) {
        case 'created':
          return (
            <>
              <span className="font-semibold">{user.name}</span> created entry{' '}
              <Link
                href={`/dashboard/entries/${activity.entityId}/edit`}
                className="text-blue-600 hover:underline"
              >
                {entryName}
              </Link>
            </>
          )
        case 'updated':
          return (
            <>
              <span className="font-semibold">{user.name}</span> updated entry{' '}
              <Link
                href={`/dashboard/entries/${activity.entityId}/edit`}
                className="text-blue-600 hover:underline"
              >
                {entryName}
              </Link>
            </>
          )
        case 'finalized':
          return (
            <>
              <span className="font-semibold">{user.name}</span> finalized entry{' '}
              <Link
                href={`/dashboard/entries/${activity.entityId}/edit`}
                className="text-blue-600 hover:underline"
              >
                {entryName}
              </Link>
            </>
          )
        case 'approved':
          return (
            <>
              <span className="font-semibold">{user.name}</span> approved entry{' '}
              <Link
                href={`/dashboard/entries/${activity.entityId}/edit`}
                className="text-blue-600 hover:underline"
              >
                {entryName}
              </Link>
            </>
          )
        case 'rejected':
          return (
            <>
              <span className="font-semibold">{user.name}</span> rejected entry{' '}
              <Link
                href={`/dashboard/entries/${activity.entityId}/edit`}
                className="text-blue-600 hover:underline"
              >
                {entryName}
              </Link>
            </>
          )
        default:
          return (
            <>
              <span className="font-semibold">{user.name}</span> {action} {entryName}
            </>
          )
      }
    }

    return (
      <>
        <span className="font-semibold">{user.name}</span> {action} {entityType}
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex-shrink-0">
            {getActionIcon(activity.action)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              {getActivityDescription(activity)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTimeAgo(activity.changedAt)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
              activity.action === 'created' ? 'bg-blue-100 text-blue-700' :
              activity.action === 'updated' ? 'bg-yellow-100 text-yellow-700' :
              activity.action === 'finalized' ? 'bg-green-100 text-green-700' :
              activity.action === 'approved' ? 'bg-green-100 text-green-700' :
              activity.action === 'rejected' ? 'bg-red-100 text-red-700' :
              activity.action === 'submitted' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {activity.action}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
