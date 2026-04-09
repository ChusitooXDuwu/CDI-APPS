'use client'

import { useEffect, useState } from 'react'
import MarketCard from './MarketCard'

interface Quote {
  symbol: string
  label: string
  price: number
  change: number
  changePct: number
  volume: number
  isMock?: boolean
}

interface MarketData {
  indices: Quote[]
  sectors: Quote[]
  updatedAt: string
}

export default function MarketSection() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/market')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="text-negative text-sm text-center py-10">
        Error al cargar datos de mercado.
      </p>
    )
  }

  const hasMock = [...data.indices, ...data.sectors].some((q) => q.isMock)

  return (
    <div className="space-y-8">
      {hasMock && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-warning text-sm">
          Mostrando datos de demostración. Agrega tu <code className="font-mono text-xs bg-white/10 px-1 rounded">ALPHA_VANTAGE_KEY</code> en las variables de entorno para datos reales.
        </div>
      )}

      {/* Índices principales */}
      <div>
        <h2 className="text-xs text-muted uppercase tracking-widest font-body mb-4">
          Índices principales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.indices.map((q) => (
            <MarketCard key={q.symbol} {...q} />
          ))}
        </div>
      </div>

      {/* ETFs sectoriales */}
      <div>
        <h2 className="text-xs text-muted uppercase tracking-widest font-body mb-4">
          ETFs sectoriales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.sectors.map((q) => (
            <MarketCard key={q.symbol} {...q} />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted font-mono text-right">
        Actualizado: {new Date(data.updatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
