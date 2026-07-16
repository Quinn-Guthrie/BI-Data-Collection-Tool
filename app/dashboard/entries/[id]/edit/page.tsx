import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EntryWizard from '@/components/wizard/EntryWizard'

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect('/login')
  }

  // Fetch the entry with all related data
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      company: true,
      country: true,
      plant: true,
      segment: true,
      distributor: true,
      enzymeValues: {
        include: {
          enzymeCategory: true,
        },
      },
    },
  })

  if (!entry) {
    redirect('/dashboard')
  }

  // Check permissions - admin can edit all, others only their own
  if (
    session.user.role !== 'admin' &&
    entry.accountManagerUserId !== session.user.id
  ) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Entry</h1>
        <p className="text-gray-600 mt-1">
          {entry.company.name} - {entry.country.countryName} - {entry.segment.name}
        </p>
        {entry.rejectionReason && entry.status === 'needs_correction' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">Rejection Reason:</p>
            <p className="text-red-700 mt-1">{entry.rejectionReason}</p>
          </div>
        )}
      </div>

      <EntryWizard userId={session.user.id} entryId={id} existingEntry={entry} />
    </div>
  )
}
