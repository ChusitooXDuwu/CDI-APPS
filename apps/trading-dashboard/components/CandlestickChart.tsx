'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function CandlestickChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111113' },
        textColor: '#6B7280',
      },
      grid: {
        vertLines: { color: '#1E1E22' },
        horzLines: { color: '#1E1E22' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1E1E22',
      },
      timeScale: {
        borderColor: '#1E1E22',
        timeVisible: true,
      },
      width: containerRef.current.clientWidth,
      height: 380,
    })

    // Velas
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4ADE80',
      downColor: '#F87171',
      borderUpColor: '#4ADE80',
      borderDownColor: '#F87171',
      wickUpColor: '#4ADE80',
      wickDownColor: '#F87171',
    })

    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    )

    // Volumen
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#C8F135',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? '#4ADE8033' : '#F8717133',
      }))
    )

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [candles])

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
}
