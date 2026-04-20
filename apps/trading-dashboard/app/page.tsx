import Link from 'next/link'
import MarketSection from '@/components/MarketSection'
import TradesSection from '@/components/TradesSection'
import SearchBar from '@/components/SearchBar'
import MarketBreadth from '@/components/MarketBreadth'
import { createClient } from '@/lib/supabase/server'
import { hasMiniaturasAccess } from '@/lib/access'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const canMiniaturas = hasMiniaturasAccess(user?.email)

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
          {user ? (
            <div className="flex items-center gap-4">
              {canMiniaturas && (
                <Link
                  href="/miniaturas"
                  className="text-xs font-mono text-accent hover:underline whitespace-nowrap"
                >
                  Miniaturas →
                </Link>
              )}
              <Link
                href="/portafolios"
                className="text-xs font-mono text-accent hover:underline whitespace-nowrap"
              >
                Portafolios →
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-mono bg-accent text-bg font-bold px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
        {/* Breadth / Sentimiento */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display font-bold text-xl text-white">Sentimiento de Mercado</h2>
          </div>
          <MarketBreadth />
        </section>

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
