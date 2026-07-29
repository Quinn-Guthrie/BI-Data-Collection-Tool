'use client'

import { useState, ReactNode } from 'react'

interface CollapsibleProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export default function Collapsible({ title, defaultOpen = true, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 transition-colors hover:bg-white/5"
      >
        <h2 className="text-lg font-bold tracking-tight" style={{ color: '#D9E2F0' }}>
          {title}
        </h2>
        <svg
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: '#B0BCD3' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 animate-in">
          {children}
        </div>
      )}
    </div>
  )
}
