'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SUGGESTIONS = [
  'SPY', 'QQQ', 'DIA', 'IWM',
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLC', 'XLY', 'XLRE',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL',
]

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<string[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase()
    setQuery(val)
    if (val.length > 0) {
      setFiltered(SUGGESTIONS.filter((s) => s.startsWith(val)).slice(0, 6))
    } else {
      setFiltered([])
    }
  }

  function navigate(symbol: string) {
    setQuery('')
    setFiltered([])
    router.push(`/ticker/${symbol.toUpperCase()}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim().length > 0) {
      navigate(query.trim())
    }
    if (e.key === 'Escape') {
      setFiltered([])
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2 focus-within:border-accent/50 transition-colors">
        <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar ticker..."
          className="bg-transparent text-sm text-white placeholder-muted outline-none w-36 font-mono uppercase"
        />
      </div>

      {filtered.length > 0 && (
        <div className="absolute top-full mt-1 right-0 w-48 bg-surface border border-[#1E1E22] rounded-lg overflow-hidden z-50 shadow-xl">
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => navigate(s)}
              className="w-full text-left px-4 py-2.5 text-sm font-mono text-white hover:bg-accent/10 hover:text-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
