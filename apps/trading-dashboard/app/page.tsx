import MarketSection from '@/components/MarketSection'
import TradesSection from '@/components/TradesSection'
import SearchBar from '@/components/SearchBar'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-[#1E1E22] px-6 py-4 flex items-center justify-between sticky top-0 bg-bg/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h1 className="font-display font-bold text-lg tracking-tight text-white">
            CDI <span className="text-accent">Trading</span> Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar />
          <span className="text-xs text-muted font-mono hidden md:block">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
        {/* Mercado */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display font-bold text-xl text-white">Cierre de Mercado</h2>
            <span className="text-xs font-mono text-muted bg-surface border border-[#1E1E22] px-2 py-0.5 rounded-md">
              EOD
            </span>
          </div>
          <MarketSection />
        </section>

        {/* Trades */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display font-bold text-xl text-white">Score de Trades</h2>
            <span className="text-xs font-mono text-muted bg-surface border border-[#1E1E22] px-2 py-0.5 rounded-md">
              DEMO
            </span>
          </div>
          <TradesSection />
        </section>
      </div>
    </main>
  )
}
