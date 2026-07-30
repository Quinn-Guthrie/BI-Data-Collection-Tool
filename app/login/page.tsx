'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import ThemeToggle from '@/components/ThemeToggle'

function LoginForm() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [email, setEmail] = useState('admin@foodbio.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess('Account created successfully! Please sign in.')
      setEmail('')
      setPassword('')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="card">
          <div className="p-8">
            <div className="text-center mb-8">
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl"
                style={{
                  background: isLight
                    ? 'linear-gradient(145deg, #0075cf 0%, #005ba3 100%)'
                    : 'linear-gradient(145deg, #CDE9FF 0%, #A8D5FF 100%)',
                }}
              >
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  style={{ color: isLight ? '#ffffff' : '#0a0a0a' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: isLight ? '#1a1a1a' : '#FFFFFF' }}
              >
                Food Biosciences
              </h1>
              <p
                className="text-muted"
                style={{ fontSize: '0.938rem' }}
              >
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="admin@foodbio.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  className="rounded-2xl p-4 text-sm font-medium"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="rounded-2xl p-4 text-sm font-medium"
                  style={{
                    background: 'rgba(77, 225, 208, 0.15)',
                    border: '1px solid rgba(77, 225, 208, 0.3)',
                    color: '#4DE1D0',
                  }}
                >
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-default w-full">
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs" style={{ color: '#6B7A94' }}>
                Secure authentication powered by NextAuth
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div style={{ color: '#B0BCD3' }}>Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
