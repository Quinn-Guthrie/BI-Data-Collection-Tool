import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FileUpload from '@/components/admin/FileUpload'
import Link from 'next/link'

export default async function ImportPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Entries</h1>
          <p className="text-gray-600 mt-1">
            Upload a CSV or Excel file to bulk create entries
          </p>
        </div>
        <Link
          href="/dashboard/admin"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Upload Component */}
      <FileUpload />
    </div>
  )
}
