import React from 'react'
import Link from 'next/link'

type Entry = {
  id: string
  status: string
  approvalStatus: string
  confidencePercent: number | null
  rejectionReason: string | null
  sourceEntryId: string | null
  company: { name: string }
  country: { countryName: string }
  segment: { name: string }
  cycle: { name: string }
  plant: { name: string } | null
}

export default function EntriesTable({ entries }: { entries: Entry[] }) {
  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      carried_over_unconfirmed: 'bg-blue-100 text-blue-800',
      finalized: 'bg-green-100 text-green-800',
      needs_correction: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getApprovalBadge = (status: string) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-600'
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No entries found. Create your first entry to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Segment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Approval
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.plant?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.country.countryName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.segment.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {entry.status === 'carried_over_unconfirmed' && (
                      <span className="text-blue-600" title="Carried forward from previous cycle">
                        📋
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        entry.status
                      )}`}
                    >
                      {entry.status === 'carried_over_unconfirmed'
                        ? 'Needs Confirmation'
                        : entry.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getApprovalBadge(
                      entry.approvalStatus
                    )}`}
                  >
                    {entry.approvalStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.confidencePercent ? `${entry.confidencePercent}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/dashboard/entries/${entry.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
              {entry.rejectionReason && entry.status === 'needs_correction' && (
                <tr>
                  <td colSpan={8} className="px-6 py-3 bg-red-50">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-semibold text-sm">Rejected:</span>
                      <span className="text-red-700 text-sm">{entry.rejectionReason}</span>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
