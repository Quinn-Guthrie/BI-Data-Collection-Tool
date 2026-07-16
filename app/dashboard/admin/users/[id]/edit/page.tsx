'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserSegment = {
  segment: {
    id: string
    name: string
    slug: string
    color: string
  }
}

type User = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  userSegments: UserSegment[]
}

type Segment = {
  id: string
  name: string
  slug: string
  color: string
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'account_manager',
  })

  useEffect(() => {
    loadUser()
    loadSegments()
  }, [])

  const loadUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setFormData({
          name: data.name,
          email: data.email,
          role: data.role,
        })
        setSelectedSegments(data.userSegments.map((us: UserSegment) => us.segment.id))
      } else {
        setError('Failed to load user')
      }
    } catch (err) {
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const loadSegments = async () => {
    try {
      const res = await fetch('/api/segments')
      if (res.ok) {
        const data = await res.json()
        setSegments(data)
      }
    } catch (err) {
      console.error('Failed to load segments:', err)
    }
  }

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    if (selectedSegments.length === 0) {
      setError('Please select at least one business segment')
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          segments: selectedSegments,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('User updated successfully!')
        setTimeout(() => {
          router.push('/dashboard/admin/users')
        }, 1500)
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!user) {
    return <div className="text-center text-red-600">User not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/admin/users" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-2">Update user information and segment assignments</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="account_manager">Account Manager</option>
            <option value="reviewer">Reviewer</option>
            <option value="approver">Approver</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Note: super_admin role cannot be changed here
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Segments * <span className="text-xs text-gray-500">(Select all that apply)</span>
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {segments.map((segment) => (
              <label
                key={segment.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSegments.includes(segment.id)}
                  onChange={() => toggleSegment(segment.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{segment.name}</span>
                </div>
              </label>
            ))}
          </div>
          {selectedSegments.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              ✓ {selectedSegments.length} segment{selectedSegments.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/dashboard/admin/users"
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
