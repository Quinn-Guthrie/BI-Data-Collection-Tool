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
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #CDE9FF 0%, #A8D5FF 100%)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  style={{ color: '#0a0a0a' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                Food Bio
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold" style={{ color: '#D9E2F0' }}>
                {user.name}
              </p>
              <p className="text-xs" style={{ color: '#6B7A94' }}>
                {user.role === 'super_admin' ? 'Super Admin' : 'Account Manager'}
              </p>
            </div>

            <ThemeToggle />

            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-outline btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
