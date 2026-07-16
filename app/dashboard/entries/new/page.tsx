import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EntryWizard from '@/components/wizard/EntryWizard'

export default async function NewEntryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Entry</h1>
        <p className="text-gray-600 mt-1">
          Complete all 7 steps to finalize your entry
        </p>
      </div>

      <EntryWizard userId={session.user.id} />
    </div>
  )
}
