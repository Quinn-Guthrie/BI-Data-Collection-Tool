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
        style: 'badge badge-primary',
      },
      account_manager: {
        label: 'Account Manager',
        style: 'badge',
      },
    }
    return badges[role as keyof typeof badges] || badges.account_manager
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <header
      className="border-b shadow-sm"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center">
              <h1
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Food Biosciences
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-hover)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/entries/new"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-hover)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                New Entry
              </Link>

              {(user.role === 'super_admin') && (
                <Link
                  href="/dashboard/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-hover)'
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Right Side - User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {user.name}
                </p>
                <span className={roleBadge.style}>{roleBadge.label}</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn-secondary btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
