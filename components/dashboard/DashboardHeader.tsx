'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface User {
  name?: string | null
  email?: string | null
  role: string
  region: string | null
}

export default function DashboardHeader({ user }: { user: User }) {
  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      admin: 'bg-purple-100 text-purple-800',
      approver: 'bg-green-100 text-green-800',
      reviewer: 'bg-blue-100 text-blue-800',
      account_manager: 'bg-gray-100 text-gray-800',
    }
    return badges[role as keyof typeof badges] || badges.account_manager
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Food Biosciences Data Collection
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/entries/new"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                New Entry
              </Link>
              {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'approver') && (
                <Link
                  href="/dashboard/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <div className="flex items-center gap-2 justify-end">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role.replace('_', ' ')}
                </span>
                {user.region && (
                  <span className="text-xs text-gray-500">{user.region}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
