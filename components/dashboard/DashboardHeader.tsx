'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle'

interface User {
  name?: string | null
  email?: string | null
  role: string
}

export default function DashboardHeader({ user }: { user: User }) {
  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: {
        label: 'Super Admin',
        className: 'badge-default',
      },
      account_manager: {
        label: 'Account Manager',
        className: 'badge-secondary',
      },
    }
    return badges[role as keyof typeof badges] || badges.account_manager
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center">
        {/* Left Side - Logo & Nav */}
        <div className="mr-4 flex md:mr-6">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-h4 font-bold">Food Biosciences</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/dashboard" className="btn-ghost text-sm">
              Dashboard
            </Link>

            <Link href="/dashboard/entries/new" className="btn-ghost text-sm">
              New Entry
            </Link>

            {user.role === 'super_admin' && (
              <Link href="/dashboard/admin" className="btn-ghost text-sm">
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side - User Info & Actions */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          {/* User Info */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <span className={`badge ${roleBadge.className} mt-1`}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn-outline btn-sm"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
