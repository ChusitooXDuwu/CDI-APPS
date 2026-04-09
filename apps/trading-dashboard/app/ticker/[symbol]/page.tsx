import Link from 'next/link'
import TickerDetail from './TickerDetail'

export default function TickerPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-[#1E1E22] px-6 py-4 flex items-center justify-between sticky top-0 bg-bg/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-display font-bold text-lg tracking-tight text-white">
            CDI <span className="text-accent">Trading</span> Dashboard
          </h1>
        </div>
        <span className="font-mono text-accent font-bold text-sm">{symbol}</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <TickerDetail symbol={symbol} />
      </div>
    </main>
  )
}
