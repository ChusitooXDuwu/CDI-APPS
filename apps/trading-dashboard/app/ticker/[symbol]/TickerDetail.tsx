'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), { ssr: false })

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  high52w: number | null
  low52w: number | null
  currency: string
  exchange: string
  candles: {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
}

export default function TickerDetail({ symbol }: { symbol: string }) {
  const [data, setData] = useState<TickerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/ticker/${symbol}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar datos')
        setLoading(false)
      })
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-32">
        <p className="text-negative text-sm">{error ?? 'Ticker no encontrado'}</p>
      </div>
    )
  }

  const isPositive = data.changePct >= 0

  return (
    <div className="space-y-6">
      {/* Header ticker */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wider">{data.exchange}</p>
          <h2 className="font-display font-bold text-3xl text-white mt-1">{data.symbol}</h2>
          <p className="text-muted text-sm mt-0.5">{data.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-4xl text-white">
            ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`font-mono text-lg font-semibold mt-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.changePct.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Volumen" value={(data.volume / 1_000_000).toFixed(1) + 'M'} />
        <StatBox label="Prev. Close" value={`$${data.price - data.change > 0 ? (data.price - data.change).toFixed(2) : '--'}`} />
        <StatBox label="52W High" value={data.high52w ? `$${data.high52w.toFixed(2)}` : '--'} />
        <StatBox label="52W Low" value={data.low52w ? `$${data.low52w.toFixed(2)}` : '--'} />
      </div>

      {/* Chart */}
      <div className="bg-surface border border-[#1E1E22] rounded-xl p-4">
        <p className="text-xs text-muted uppercase tracking-wider font-body mb-4">
          Velas diarias — 6 meses
        </p>
        {data.candles.length > 0 ? (
          <CandlestickChart candles={data.candles} />
        ) : (
          <p className="text-muted text-sm text-center py-16">Sin datos históricos disponibles</p>
        )}
      </div>

      <p className="text-xs text-muted font-mono text-right">
        Datos con ~15min de delay · Yahoo Finance
      </p>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl p-4">
      <p className="text-xs text-muted uppercase tracking-wider font-body">{label}</p>
      <p className="font-mono font-semibold text-white text-lg mt-1">{value}</p>
    </div>
  )
}
