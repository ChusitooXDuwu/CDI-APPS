import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortafolioDetail from './PortafolioDetail'

export default async function PortafolioPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: portafolio } = await supabase
    .from('portafolios')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!portafolio) notFound()

  const [{ data: posiciones }, { data: ventas }] = await Promise.all([
    supabase.from('posiciones').select('*').eq('portafolio_id', params.id).order('fecha_compra', { ascending: false }),
    supabase.from('ventas').select('*').eq('portafolio_id', params.id).order('fecha_venta', { ascending: false }),
  ])

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-[#1E1E22] px-6 py-4 flex items-center justify-between sticky top-0 bg-bg/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link href="/portafolios" className="text-muted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-display font-bold text-lg tracking-tight text-white">
            CDI <span className="text-accent">Trading</span>
          </h1>
          <span className="text-xs text-muted font-mono">/ {portafolio.nombre}</span>
        </div>
        <span className="text-xs text-muted font-mono hidden md:block">{user?.email}</span>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <PortafolioDetail
          portafolio={portafolio}
          posicionesInitial={posiciones ?? []}
          ventasInitial={ventas ?? []}
        />
      </div>
    </main>
  )
}
