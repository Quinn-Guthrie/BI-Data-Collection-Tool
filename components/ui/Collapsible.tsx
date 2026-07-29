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
        className="flex w-full items-center justify-between card-header transition-colors hover:bg-muted/50"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="card-content animate-in">
          {children}
        </div>
      )}
    </div>
  )
}
