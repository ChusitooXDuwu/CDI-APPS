'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  Time,
} from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type DrawTool = 'none' | 'hline' | 'trendline' | 'rect'
type Indicator = 'MA20' | 'MA50'

interface DrawnLine {
  id: string
  type: 'hline'
  price: number
  color: string
}

function calcMA(candles: Candle[], period: number) {
  return candles.map((c, i) => {
    if (i < period - 1) return null
    const slice = candles.slice(i - period + 1, i + 1)
    const avg = slice.reduce((s, x) => s + x.close, 0) / period
    return { time: c.time, value: parseFloat(avg.toFixed(4)) }
  }).filter(Boolean) as { time: number; value: number }[]
}

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y']
const COLORS = ['#C8F135', '#60A5FA', '#F472B6', '#FB923C', '#A78BFA']

export default function TradingChart({
  candles: initialCandles,
  symbol,
  tf: initialTf,
  onTfChange,
}: {
  candles: Candle[]
  symbol: string
  tf: string
  onTfChange: (tf: string) => void
}) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const chartRef      = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const ma20Ref       = useRef<ISeriesApi<'Line'> | null>(null)
  const ma50Ref       = useRef<ISeriesApi<'Line'> | null>(null)
  const hlineRefs     = useRef<Map<string, ISeriesApi<'Line'>>>(new Map())

  const [activeTool, setActiveTool]     = useState<DrawTool>('none')
  const [indicators, setIndicators]     = useState<Set<Indicator>>(new Set<Indicator>(['MA20', 'MA50']))
  const [drawnLines, setDrawnLines]     = useState<DrawnLine[]>([])
  const [crosshairData, setCrosshairData] = useState<{
    time?: string; open?: number; high?: number; low?: number; close?: number; volume?: number; change?: number
  }>({})
  const [colorIdx, setColorIdx]         = useState(0)
  const candles = initialCandles

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111113' },
        textColor: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E1E22' },
        horzLines: { color: '#1E1E22' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#C8F13560', labelBackgroundColor: '#1E1E22' },
        horzLine: { color: '#C8F13560', labelBackgroundColor: '#1E1E22' },
      },
      rightPriceScale: { borderColor: '#1E1E22' },
      timeScale: { borderColor: '#1E1E22', timeVisible: true, secondsVisible: false },
      handleScale: { axisPressedMouseMove: { time: true, price: true } },
      width: containerRef.current.clientWidth,
      height: 500,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:        '#4ADE80',
      downColor:      '#F87171',
      borderUpColor:  '#4ADE80',
      borderDownColor:'#F87171',
      wickUpColor:    '#4ADE80',
      wickDownColor:  '#F87171',
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat:  { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })

    chartRef.current      = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // Update candle data when candles / tf changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return

    const sorted = [...candles].sort((a, b) => a.time - b.time)

    candleSeriesRef.current.setData(
      sorted.map((c) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }))
    )
    volumeSeriesRef.current.setData(
      sorted.map((c) => ({
        time:  c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? '#4ADE8022' : '#F8717122',
      }))
    )
    chartRef.current?.timeScale().fitContent()

    // crosshair subscription
    const handler = (param: MouseEventParams) => {
      if (!param.time || !param.seriesData) { setCrosshairData({}); return }
      const bar = param.seriesData.get(candleSeriesRef.current!) as any
      const vol = param.seriesData.get(volumeSeriesRef.current!) as any
      if (!bar) return
      const prev = sorted.find((c) => c.time < (param.time as number))
      const change = prev ? parseFloat(((bar.close - prev.close) / prev.close * 100).toFixed(2)) : 0
      setCrosshairData({
        time:   new Date((param.time as number) * 1000).toLocaleDateString('es-MX'),
        open:   bar.open,
        high:   bar.high,
        low:    bar.low,
        close:  bar.close,
        volume: vol?.value,
        change,
      })
    }
    chartRef.current?.subscribeCrosshairMove(handler)
    return () => { chartRef.current?.unsubscribeCrosshairMove(handler) }
  }, [candles])

  // MA indicators
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return

    if (indicators.has('MA20')) {
      if (!ma20Ref.current) {
        ma20Ref.current = chartRef.current.addSeries(LineSeries, {
          color: '#60A5FA', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        })
      }
      ma20Ref.current.setData(calcMA(candles, 20).map((d) => ({ ...d, time: d.time as Time })))
    } else if (ma20Ref.current) {
      chartRef.current.removeSeries(ma20Ref.current)
      ma20Ref.current = null
    }

    if (indicators.has('MA50')) {
      if (!ma50Ref.current) {
        ma50Ref.current = chartRef.current.addSeries(LineSeries, {
          color: '#F472B6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        })
      }
      ma50Ref.current.setData(calcMA(candles, 50).map((d) => ({ ...d, time: d.time as Time })))
    } else if (ma50Ref.current) {
      chartRef.current.removeSeries(ma50Ref.current)
      ma50Ref.current = null
    }
  }, [indicators, candles])

  // Click to draw hline
  const handleChartClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'hline' || !chartRef.current || !candleSeriesRef.current) return

    const rect = containerRef.current!.getBoundingClientRect()
    const y = e.clientY - rect.top
    const price = candleSeriesRef.current.coordinateToPrice(y)
    if (price === null) return

    const id    = Date.now().toString()
    const color = COLORS[colorIdx % COLORS.length]
    setColorIdx((c) => c + 1)

    const series = chartRef.current.addSeries(LineSeries, {
      color,
      lineWidth: 1,
      lineStyle: 1, // dashed
      priceLineVisible: false,
      lastValueVisible: true,
    })

    // Draw across full time range
    const sorted = [...candles].sort((a, b) => a.time - b.time)
    if (sorted.length > 1) {
      series.setData([
        { time: sorted[0].time as Time, value: price },
        { time: sorted[sorted.length - 1].time as Time, value: price },
      ])
    }

    hlineRefs.current.set(id, series)
    setDrawnLines((prev) => [...prev, { id, type: 'hline', price, color }])
    setActiveTool('none')
  }, [activeTool, candles, colorIdx])

  function removeLine(id: string) {
    const series = hlineRefs.current.get(id)
    if (series && chartRef.current) {
      chartRef.current.removeSeries(series)
      hlineRefs.current.delete(id)
    }
    setDrawnLines((prev) => prev.filter((l) => l.id !== id))
  }

  function clearAll() {
    drawnLines.forEach((l) => removeLine(l.id))
  }

  function toggleIndicator(ind: Indicator) {
    setIndicators((prev) => {
      const next = new Set(prev)
      next.has(ind) ? next.delete(ind) : next.add(ind)
      return next
    })
  }

  const last = candles.length > 0 ? candles[candles.length - 1] : null

  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl overflow-hidden">
      {/* Toolbar superior */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1E1E22] flex-wrap">
        {/* Temporalidades */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => onTfChange(t)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                initialTf === t
                  ? 'bg-accent text-bg font-bold'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#1E1E22] mx-1" />

        {/* Indicadores */}
        {(['MA20', 'MA50'] as Indicator[]).map((ind) => (
          <button
            key={ind}
            onClick={() => toggleIndicator(ind)}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
              indicators.has(ind)
                ? ind === 'MA20'
                  ? 'border-blue-400/50 text-blue-400 bg-blue-400/10'
                  : 'border-pink-400/50 text-pink-400 bg-pink-400/10'
                : 'border-[#1E1E22] text-muted hover:text-white'
            }`}
          >
            {ind}
          </button>
        ))}

        <div className="w-px h-4 bg-[#1E1E22] mx-1" />

        {/* Herramientas de dibujo */}
        <button
          onClick={() => setActiveTool(activeTool === 'hline' ? 'none' : 'hline')}
          title="Línea horizontal"
          className={`p-1.5 rounded transition-colors ${
            activeTool === 'hline' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-white'
          }`}
        >
          {/* Línea horizontal icon */}
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1"/>
            <circle cx="8" cy="8" r="2" fill="currentColor"/>
          </svg>
        </button>

        {drawnLines.length > 0 && (
          <button
            onClick={clearAll}
            className="px-2 py-1 text-xs font-mono text-negative hover:bg-negative/10 rounded transition-colors"
          >
            Limpiar
          </button>
        )}

        {activeTool !== 'none' && (
          <span className="text-xs text-accent font-mono animate-pulse ml-1">
            Click en el chart para dibujar
          </span>
        )}
      </div>

      {/* Crosshair info bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b border-[#1E1E22] bg-bg/50 min-h-[28px]">
        {crosshairData.time ? (
          <>
            <span className="text-[11px] font-mono text-muted">{crosshairData.time}</span>
            <span className="text-[11px] font-mono">O <span className="text-white">{crosshairData.open?.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">H <span className="text-positive">{crosshairData.high?.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">L <span className="text-negative">{crosshairData.low?.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">C <span className="text-white">{crosshairData.close?.toFixed(2)}</span></span>
            {crosshairData.change !== undefined && (
              <span className={`text-[11px] font-mono ${crosshairData.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                {crosshairData.change >= 0 ? '+' : ''}{crosshairData.change}%
              </span>
            )}
            {crosshairData.volume !== undefined && (
              <span className="text-[11px] font-mono text-muted">
                Vol {(crosshairData.volume / 1_000_000).toFixed(1)}M
              </span>
            )}
          </>
        ) : last ? (
          <>
            <span className="text-[11px] font-mono text-muted">{symbol}</span>
            <span className="text-[11px] font-mono">O <span className="text-white">{last.open.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">H <span className="text-positive">{last.high.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">L <span className="text-negative">{last.low.toFixed(2)}</span></span>
            <span className="text-[11px] font-mono">C <span className="text-white">{last.close.toFixed(2)}</span></span>
          </>
        ) : null}
      </div>

      {/* Chart area */}
      <div
        ref={containerRef}
        onClick={handleChartClick}
        className={activeTool !== 'none' ? 'cursor-crosshair' : 'cursor-default'}
      />

      {/* Líneas dibujadas */}
      {drawnLines.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#1E1E22] flex-wrap">
          {drawnLines.map((l) => (
            <div key={l.id} className="flex items-center gap-1.5 bg-bg border border-[#1E1E22] rounded px-2 py-1">
              <span className="w-2.5 h-0.5 rounded" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] font-mono text-muted">${l.price.toFixed(2)}</span>
              <button onClick={() => removeLine(l.id)} className="text-muted hover:text-negative ml-1 text-xs">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
