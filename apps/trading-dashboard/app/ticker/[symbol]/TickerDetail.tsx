'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('@/components/TradingChart'), { ssr: false })

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  prev: number
  volume: number
  high52w: number | null
  low52w: number | null
  currency: string
  exchange: string
  marketCap: number | null
  candles: {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
  tf: string
}

export default function TickerDetail({ symbol }: { symbol: string }) {
  const [data, setData]       = useState<TickerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tf, setTf]           = useState('6M')

  const fetchData = useCallback((timeframe: string) => {
    setLoading(true)
    fetch(`/api/ticker/${symbol}?tf=${timeframe}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else { setData(d); setError(null) }
        setLoading(false)
      })
      .catch(() => { setError('Error al cargar datos'); setLoading(false) })
  }, [symbol])

  useEffect(() => { fetchData(tf) }, [tf, fetchData])

  if (error) {
    return (
      <div className="text-center py-32">
        <p className="text-negative text-sm">{error}</p>
      </div>
    )
  }

  const isPositive = (data?.changePct ?? 0) >= 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted font-mono uppercase">{data?.exchange}</p>
            <span className="text-xs text-muted">·</span>
            <p className="text-xs text-muted font-mono">{data?.currency}</p>
          </div>
          <h2 className="font-display font-bold text-3xl text-white mt-1">{symbol}</h2>
          <p className="text-muted text-sm mt-0.5 max-w-md">{data?.name}</p>
        </div>

        {data && (
          <div className="text-right">
            <p className="font-mono font-bold text-4xl text-white">
              ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`font-mono text-lg font-semibold mt-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? '+' : ''}{data.change.toFixed(2)}&nbsp;
              <span className="text-base">({isPositive ? '+' : ''}{data.changePct.toFixed(2)}%)</span>
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <StatBox label="Volumen"    value={`${(data.volume / 1_000_000).toFixed(1)}M`} />
          <StatBox label="Prev Close" value={`$${data.prev.toFixed(2)}`} />
          <StatBox label="52W High"   value={data.high52w ? `$${data.high52w.toFixed(2)}` : '--'} />
          <StatBox label="52W Low"    value={data.low52w  ? `$${data.low52w.toFixed(2)}`  : '--'} />
          <StatBox
            label="Mkt Cap"
            value={data.marketCap
              ? data.marketCap >= 1e12
                ? `$${(data.marketCap / 1e12).toFixed(2)}T`
                : `$${(data.marketCap / 1e9).toFixed(1)}B`
              : '--'}
          />
        </div>
      )}

      {/* Chart */}
      {loading && !data ? (
        <div className="flex items-center justify-center h-[560px] bg-surface border border-[#1E1E22] rounded-xl">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data && data.candles.length > 0 ? (
        <TradingChart
          candles={data.candles}
          symbol={symbol}
          tf={tf}
          onTfChange={setTf}
        />
      ) : (
        <div className="flex items-center justify-center h-[560px] bg-surface border border-[#1E1E22] rounded-xl">
          <p className="text-muted text-sm">Sin datos históricos para esta temporalidad</p>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="w-6 h-0.5 bg-blue-400 inline-block rounded" /> MA20
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="w-6 h-0.5 bg-pink-400 inline-block rounded" /> MA50
        </span>
        <span className="ml-auto text-muted">
          Datos con ~15min delay · Yahoo Finance
        </span>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl p-3">
      <p className="text-[10px] text-muted uppercase tracking-wider font-body">{label}</p>
      <p className="font-mono font-semibold text-white text-sm mt-1">{value}</p>
    </div>
  )
}
