'use client'

import { useEffect, useState } from 'react'

interface BreadthData {
  vix: {
    value: number | null
    change: number | null
    fearLevel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  }
  consecutiveDays: { count: number; direction: 'up' | 'down' | 'flat' }
  ema: {
    ema8: number | null
    ema21: number | null
    spyClose: number | null
    aboveEMA8: boolean | null
    aboveEMA21: boolean | null
  }
  sma: { pctAboveSMA20: number; pctAboveSMA50: number }
  yearRange: { high: number; low: number; isNewHigh: boolean; isNewLow: boolean }
  earnings: { symbol: string; company: string; epsEst: number | null; time: string }[]
  updatedAt: string
}

const FEAR_CONFIG = {
  'Extreme Fear': { color: 'text-red-400',    bg: 'bg-red-400/10',    bar: 'bg-red-400',    pct: 10 },
  'Fear':         { color: 'text-negative',   bg: 'bg-negative/10',  bar: 'bg-negative',   pct: 30 },
  'Neutral':      { color: 'text-warning',    bg: 'bg-warning/10',   bar: 'bg-warning',    pct: 50 },
  'Greed':        { color: 'text-positive',   bg: 'bg-positive/10',  bar: 'bg-positive',   pct: 70 },
  'Extreme Greed':{ color: 'text-accent',     bg: 'bg-accent/10',    bar: 'bg-accent',     pct: 92 },
}

function PctBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? 'bg-positive' : value >= 40 ? 'bg-warning' : 'bg-negative'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-[#1E1E22] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function MarketBreadth() {
  const [data, setData]     = useState<BreadthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/market-breadth')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const fear   = FEAR_CONFIG[data.vix.fearLevel]
  const dir    = data.consecutiveDays.direction
  const dirUp  = dir === 'up'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* VIX / Fear */}
      <div className="bg-surface border border-[#1E1E22] rounded-xl p-5 flex flex-col gap-3">
        <p className="text-xs text-muted uppercase tracking-widest font-body">VIX · Índice del Miedo</p>

        <div className="flex items-end justify-between">
          <p className={`text-4xl font-mono font-bold ${fear.color}`}>
            {data.vix.value?.toFixed(2) ?? '--'}
          </p>
          {data.vix.change !== null && (
            <span className={`text-sm font-mono ${data.vix.change >= 0 ? 'text-negative' : 'text-positive'}`}>
              {data.vix.change >= 0 ? '+' : ''}{data.vix.change}
            </span>
          )}
        </div>

        {/* Barra de miedo */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-muted">
            <span>Miedo extremo</span>
            <span>Codicia extrema</span>
          </div>
          <div className="h-2 bg-[#1E1E22] rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-warning to-positive"
              style={{ width: '100%', opacity: 0.3 }}
            />
            <div
              className="absolute top-0 h-full w-1 bg-white rounded-full shadow"
              style={{ left: `calc(${fear.pct}% - 2px)` }}
            />
          </div>
        </div>

        <span className={`text-xs font-mono font-semibold px-2 py-1 rounded self-start ${fear.color} ${fear.bg}`}>
          {data.vix.fearLevel}
        </span>
      </div>

      {/* Tendencia SPY */}
      <div className="bg-surface border border-[#1E1E22] rounded-xl p-5 flex flex-col gap-3">
        <p className="text-xs text-muted uppercase tracking-widest font-body">SPY · Tendencia</p>

        <div className="flex items-center gap-3">
          <span className={`text-4xl font-mono font-bold ${dirUp ? 'text-positive' : dir === 'down' ? 'text-negative' : 'text-muted'}`}>
            {dirUp ? '▲' : dir === 'down' ? '▼' : '—'}
          </span>
          <div>
            <p className={`text-xl font-mono font-bold ${dirUp ? 'text-positive' : dir === 'down' ? 'text-negative' : 'text-muted'}`}>
              {data.consecutiveDays.count} días
            </p>
            <p className="text-xs text-muted font-mono">consecutivos {dirUp ? 'al alza' : 'a la baja'}</p>
          </div>
        </div>

        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">EMA 8</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white">${data.ema.ema8}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                data.ema.aboveEMA8 ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'
              }`}>
                {data.ema.aboveEMA8 ? 'Sobre' : 'Bajo'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">EMA 21</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white">${data.ema.ema21}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                data.ema.aboveEMA21 ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'
              }`}>
                {data.ema.aboveEMA21 ? 'Sobre' : 'Bajo'}
              </span>
            </div>
          </div>
        </div>

        {/* 52W */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-[#1E1E22]">
          {data.yearRange.isNewHigh && (
            <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
              52W HIGH
            </span>
          )}
          {data.yearRange.isNewLow && (
            <span className="text-[10px] font-mono text-negative bg-negative/10 px-2 py-0.5 rounded">
              52W LOW
            </span>
          )}
          {!data.yearRange.isNewHigh && !data.yearRange.isNewLow && (
            <span className="text-[10px] font-mono text-muted">
              Rango: ${data.yearRange.low} — ${data.yearRange.high}
            </span>
          )}
        </div>
      </div>

      {/* % días sobre SMA */}
      <div className="bg-surface border border-[#1E1E22] rounded-xl p-5 flex flex-col gap-4">
        <p className="text-xs text-muted uppercase tracking-widest font-body">SPY · Días sobre media</p>
        <p className="text-[10px] text-muted font-mono">Últimas 60 sesiones</p>

        <div className="space-y-4 mt-1">
          <PctBar value={data.sma.pctAboveSMA20} label="Días > SMA 20" />
          <PctBar value={data.sma.pctAboveSMA50} label="Días > SMA 50" />
        </div>

        <div className="mt-auto pt-3 border-t border-[#1E1E22] grid grid-cols-3 text-center gap-1">
          {[
            { label: 'Bajista', color: 'text-negative', range: '< 40%' },
            { label: 'Neutral',  color: 'text-warning',  range: '40–70%' },
            { label: 'Alcista',  color: 'text-positive', range: '> 70%' },
          ].map((item) => (
            <div key={item.label}>
              <p className={`text-[10px] font-mono font-semibold ${item.color}`}>{item.label}</p>
              <p className="text-[9px] font-mono text-muted">{item.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-surface border border-[#1E1E22] rounded-xl p-5 flex flex-col gap-3">
        <p className="text-xs text-muted uppercase tracking-widest font-body">Earnings hoy</p>

        {data.earnings.length === 0 ? (
          <p className="text-muted text-sm font-mono mt-2">Sin earnings hoy</p>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[200px]">
            {data.earnings.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1E1E22] last:border-0">
                <div>
                  <p className="text-sm font-mono font-bold text-white">{e.symbol}</p>
                  <p className="text-[10px] text-muted font-body truncate max-w-[120px]">{e.company}</p>
                </div>
                <div className="text-right">
                  {e.epsEst !== null && (
                    <p className="text-xs font-mono text-muted">EPS est. <span className="text-white">{e.epsEst}</span></p>
                  )}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    e.time === 'BMO'
                      ? 'text-warning bg-warning/10'
                      : 'text-blue-400 bg-blue-400/10'
                  }`}>
                    {e.time === 'BMO' ? 'Pre-market' : e.time === 'AMC' ? 'Post-market' : e.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] font-mono text-muted mt-auto pt-2 border-t border-[#1E1E22]">
          {new Date(data.updatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · Yahoo Finance
        </p>
      </div>

    </div>
  )
}
