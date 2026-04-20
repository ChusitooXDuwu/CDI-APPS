'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Portafolio { id: string; nombre: string; descripcion: string | null }
interface Posicion {
  id: string
  ticker: string
  cantidad: number
  precio_compra: number
  fecha_compra: string
  nota: string | null
}
interface Venta {
  id: string
  ticker: string
  cantidad: number
  precio_compra: number
  precio_venta: number
  fecha_compra: string
  fecha_venta: string
  pnl: number
  pnl_pct: number
  nota: string | null
}

export default function PortafolioDetail({
  portafolio,
  posicionesInitial,
  ventasInitial,
}: {
  portafolio: Portafolio
  posicionesInitial: Posicion[]
  ventasInitial: Venta[]
}) {
  const [posiciones, setPosiciones] = useState<Posicion[]>(posicionesInitial)
  const [ventas, setVentas]         = useState<Venta[]>(ventasInitial)
  const [quotes, setQuotes]         = useState<Record<string, { price: number; prev: number }>>({})
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [tab, setTab]               = useState<'activas' | 'historico'>('activas')
  const [showForm, setShowForm]     = useState(false)

  // Fetch quotes para todos los tickers activos
  useEffect(() => {
    const tickers = Array.from(new Set(posiciones.map((p) => p.ticker.toUpperCase())))
    if (tickers.length === 0) return
    setLoadingQuotes(true)
    fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers }),
    })
      .then((r) => r.json())
      .then((d) => { setQuotes(d.quotes ?? {}); setLoadingQuotes(false) })
      .catch(() => setLoadingQuotes(false))
  }, [posiciones])

  // Cálculos del portafolio
  const stats = useMemo(() => {
    let invertido = 0
    let valorActual = 0
    let cambioDia = 0

    posiciones.forEach((p) => {
      const q = quotes[p.ticker.toUpperCase()]
      invertido   += p.precio_compra * p.cantidad
      if (q) {
        valorActual += q.price * p.cantidad
        cambioDia   += (q.price - q.prev) * p.cantidad
      }
    })

    const pnlNoRealizado = valorActual - invertido
    const pnlNoRealizadoPct = invertido > 0 ? (pnlNoRealizado / invertido) * 100 : 0
    const pnlRealizado = ventas.reduce((s, v) => s + Number(v.pnl), 0)

    return {
      invertido:       parseFloat(invertido.toFixed(2)),
      valorActual:     parseFloat(valorActual.toFixed(2)),
      cambioDia:       parseFloat(cambioDia.toFixed(2)),
      pnlNoRealizado:  parseFloat(pnlNoRealizado.toFixed(2)),
      pnlNoRealizadoPct: parseFloat(pnlNoRealizadoPct.toFixed(2)),
      pnlRealizado:    parseFloat(pnlRealizado.toFixed(2)),
      pnlTotal:        parseFloat((pnlNoRealizado + pnlRealizado).toFixed(2)),
    }
  }, [posiciones, ventas, quotes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">{portafolio.nombre}</h2>
          {portafolio.descripcion && <p className="text-muted text-sm mt-1 max-w-xl">{portafolio.descripcion}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Valor actual" value={`$${stats.valorActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} big />
        <StatCard label="Invertido" value={`$${stats.invertido.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard
          label="P&L no realizado"
          value={`${stats.pnlNoRealizado >= 0 ? '+' : ''}$${stats.pnlNoRealizado.toFixed(2)}`}
          sub={`${stats.pnlNoRealizadoPct >= 0 ? '+' : ''}${stats.pnlNoRealizadoPct.toFixed(2)}%`}
          positive={stats.pnlNoRealizado >= 0}
        />
        <StatCard
          label="P&L realizado"
          value={`${stats.pnlRealizado >= 0 ? '+' : ''}$${stats.pnlRealizado.toFixed(2)}`}
          positive={stats.pnlRealizado >= 0}
        />
      </div>

      {/* Tabs + acción */}
      <div className="flex items-center justify-between border-b border-[#1E1E22]">
        <div className="flex gap-1">
          <TabButton active={tab === 'activas'} onClick={() => setTab('activas')}>
            Posiciones activas ({posiciones.length})
          </TabButton>
          <TabButton active={tab === 'historico'} onClick={() => setTab('historico')}>
            Histórico ({ventas.length})
          </TabButton>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors text-sm mb-2"
        >
          {showForm ? 'Cancelar' : '+ Nueva posición'}
        </button>
      </div>

      {showForm && (
        <AddPosicionForm
          portafolioId={portafolio.id}
          onAdd={(nueva) => { setPosiciones([nueva, ...posiciones]); setShowForm(false) }}
        />
      )}

      {tab === 'activas' ? (
        <PosicionesActivasTable
          portafolioId={portafolio.id}
          posiciones={posiciones}
          quotes={quotes}
          loadingQuotes={loadingQuotes}
          onSell={(v, newPosiciones) => {
            setVentas([v, ...ventas])
            setPosiciones(newPosiciones)
          }}
          onDelete={(id) => setPosiciones(posiciones.filter((p) => p.id !== id))}
        />
      ) : (
        <VentasTable ventas={ventas} />
      )}
    </div>
  )
}

function StatCard({ label, value, sub, positive, big }: { label: string; value: string; sub?: string; positive?: boolean; big?: boolean }) {
  const colorClass = positive === undefined ? 'text-white' : positive ? 'text-positive' : 'text-negative'
  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl p-4">
      <p className="text-xs text-muted uppercase tracking-wider font-body">{label}</p>
      <p className={`font-mono font-semibold mt-2 ${big ? 'text-2xl' : 'text-xl'} ${colorClass}`}>
        {value}
      </p>
      {sub && <p className={`text-xs font-mono mt-0.5 ${colorClass}`}>{sub}</p>}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-body transition-colors border-b-2 -mb-px ${
        active ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function AddPosicionForm({ portafolioId, onAdd }: { portafolioId: string; onAdd: (p: Posicion) => void }) {
  const [ticker, setTicker]     = useState('')
  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio]     = useState('')
  const [fecha, setFecha]       = useState(new Date().toISOString().split('T')[0])
  const [nota, setNota]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('posiciones')
      .insert({
        portafolio_id: portafolioId,
        user_id:       user.id,
        ticker:        ticker.trim().toUpperCase(),
        cantidad:      parseFloat(cantidad),
        precio_compra: parseFloat(precio),
        fecha_compra:  fecha,
        nota:          nota.trim() || null,
      })
      .select()
      .single()

    if (error) { setError(error.message); setLoading(false); return }

    onAdd(data as Posicion)
    setTicker(''); setCantidad(''); setPrecio(''); setNota('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-[#1E1E22] rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Ticker</label>
          <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required maxLength={10}
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50"
            placeholder="AAPL" />
        </div>
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Cantidad</label>
          <input type="number" step="0.0001" min="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50"
            placeholder="10" />
        </div>
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Precio compra</label>
          <input type="number" step="0.01" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} required
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50"
            placeholder="150.00" />
        </div>
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50" />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted font-body uppercase tracking-wider">Nota (opcional)</label>
        <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={200}
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          placeholder="Razón de la entrada, setup, etc." />
      </div>

      {error && <p className="text-negative text-xs">{error}</p>}

      <button type="submit" disabled={loading}
        className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm">
        {loading ? 'Guardando...' : 'Guardar posición'}
      </button>
    </form>
  )
}

function PosicionesActivasTable({
  portafolioId, posiciones, quotes, loadingQuotes, onSell, onDelete,
}: {
  portafolioId: string
  posiciones: Posicion[]
  quotes: Record<string, { price: number; prev: number }>
  loadingQuotes: boolean
  onSell: (v: Venta, newPosiciones: Posicion[]) => void
  onDelete: (id: string) => void
}) {
  const [sellingId, setSellingId] = useState<string | null>(null)

  if (posiciones.length === 0) {
    return (
      <div className="text-center py-20 bg-surface border border-[#1E1E22] rounded-xl">
        <p className="text-muted text-sm">No hay posiciones activas.</p>
        <p className="text-muted text-xs mt-1">Agrega una para empezar a trackear.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E1E22] text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-body font-normal">Ticker</th>
              <th className="text-right px-4 py-3 font-body font-normal">Cant.</th>
              <th className="text-right px-4 py-3 font-body font-normal">Precio compra</th>
              <th className="text-right px-4 py-3 font-body font-normal">Precio actual</th>
              <th className="text-right px-4 py-3 font-body font-normal">Valor</th>
              <th className="text-right px-4 py-3 font-body font-normal">P&L</th>
              <th className="text-right px-4 py-3 font-body font-normal">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posiciones.map((p) => {
              const q = quotes[p.ticker.toUpperCase()]
              const priceActual = q?.price ?? null
              const valor    = priceActual !== null ? priceActual * p.cantidad : null
              const invertido = p.precio_compra * p.cantidad
              const pnl      = valor !== null ? valor - invertido : null
              const pnlPct   = pnl !== null && invertido > 0 ? (pnl / invertido) * 100 : null
              const isPositive = (pnl ?? 0) >= 0

              return (
                <tr key={p.id} className="border-b border-[#1E1E22] hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${p.ticker}`} className="font-display font-semibold hover:text-accent transition-colors">
                      {p.ticker}
                    </Link>
                    {p.nota && <p className="text-[10px] text-muted mt-0.5 line-clamp-1 max-w-[150px]">{p.nota}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{p.cantidad}</td>
                  <td className="px-4 py-3 text-right font-mono">${p.precio_compra.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {priceActual !== null ? `$${priceActual.toFixed(2)}` : loadingQuotes ? '...' : '--'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {valor !== null ? `$${valor.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '--'}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${pnl === null ? 'text-muted' : isPositive ? 'text-positive' : 'text-negative'}`}>
                    {pnl !== null ? (
                      <>
                        {isPositive ? '+' : ''}${pnl.toFixed(2)}
                        <span className="text-[10px] ml-1">({isPositive ? '+' : ''}{pnlPct?.toFixed(2)}%)</span>
                      </>
                    ) : '--'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{p.fecha_compra}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSellingId(sellingId === p.id ? null : p.id)}
                      className="text-xs font-mono text-accent hover:underline"
                    >
                      Vender
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sell modal inline */}
      {sellingId && (() => {
        const p = posiciones.find((x) => x.id === sellingId)!
        const q = quotes[p.ticker.toUpperCase()]
        return (
          <SellForm
            portafolioId={portafolioId}
            posicion={p}
            priceSugerido={q?.price ?? p.precio_compra}
            onCancel={() => setSellingId(null)}
            onSold={(venta) => {
              const remaining = posiciones.filter((x) => x.id !== p.id)
              onSell(venta, remaining)
              onDelete(p.id)
              setSellingId(null)
            }}
          />
        )
      })()}
    </div>
  )
}

function SellForm({
  portafolioId, posicion, priceSugerido, onCancel, onSold,
}: {
  portafolioId: string
  posicion: Posicion
  priceSugerido: number
  onCancel: () => void
  onSold: (v: Venta) => void
}) {
  const [precioVenta, setPrecioVenta] = useState(priceSugerido.toFixed(2))
  const [fechaVenta, setFechaVenta]   = useState(new Date().toISOString().split('T')[0])
  const [nota, setNota]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Insertar venta
    const { data: venta, error: errV } = await supabase
      .from('ventas')
      .insert({
        portafolio_id: portafolioId,
        user_id:       user.id,
        ticker:        posicion.ticker,
        cantidad:      posicion.cantidad,
        precio_compra: posicion.precio_compra,
        precio_venta:  parseFloat(precioVenta),
        fecha_compra:  posicion.fecha_compra,
        fecha_venta:   fechaVenta,
        nota:          nota.trim() || null,
      })
      .select()
      .single()

    if (errV) { setError(errV.message); setLoading(false); return }

    // 2. Borrar posición
    const { error: errD } = await supabase.from('posiciones').delete().eq('id', posicion.id)
    if (errD) { setError(errD.message); setLoading(false); return }

    onSold(venta as Venta)
  }

  return (
    <div className="bg-bg border-t-2 border-accent/40 p-5">
      <p className="text-xs text-muted uppercase tracking-widest font-body mb-3">
        Vender {posicion.cantidad} × <span className="text-white font-mono">{posicion.ticker}</span>
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Precio venta</label>
          <input type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required
            className="w-full mt-1.5 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-xs text-muted font-body uppercase tracking-wider">Fecha</label>
          <input type="date" value={fechaVenta} onChange={(e) => setFechaVenta(e.target.value)} required
            className="w-full mt-1.5 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted font-body uppercase tracking-wider">Nota (opcional)</label>
          <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={200}
            className="w-full mt-1.5 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
            placeholder="Razón del cierre" />
        </div>

        {error && <p className="text-negative text-xs md:col-span-4">{error}</p>}

        <div className="md:col-span-4 flex gap-2">
          <button type="submit" disabled={loading}
            className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm">
            {loading ? 'Registrando...' : 'Confirmar venta'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function VentasTable({ ventas }: { ventas: Venta[] }) {
  if (ventas.length === 0) {
    return (
      <div className="text-center py-20 bg-surface border border-[#1E1E22] rounded-xl">
        <p className="text-muted text-sm">Sin operaciones cerradas aún.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E1E22] text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-body font-normal">Ticker</th>
              <th className="text-right px-4 py-3 font-body font-normal">Cant.</th>
              <th className="text-right px-4 py-3 font-body font-normal">Entry</th>
              <th className="text-right px-4 py-3 font-body font-normal">Exit</th>
              <th className="text-right px-4 py-3 font-body font-normal">P&L</th>
              <th className="text-right px-4 py-3 font-body font-normal">Compra</th>
              <th className="text-right px-4 py-3 font-body font-normal">Venta</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => {
              const pnl = Number(v.pnl)
              const pnlPct = Number(v.pnl_pct)
              const isPositive = pnl >= 0
              return (
                <tr key={v.id} className="border-b border-[#1E1E22] hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${v.ticker}`} className="font-display font-semibold hover:text-accent transition-colors">
                      {v.ticker}
                    </Link>
                    {v.nota && <p className="text-[10px] text-muted mt-0.5 line-clamp-1 max-w-[150px]">{v.nota}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{v.cantidad}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(v.precio_compra).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(v.precio_venta).toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                    {isPositive ? '+' : ''}${pnl.toFixed(2)}
                    <span className="text-[10px] ml-1">({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{v.fecha_compra}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{v.fecha_venta}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
