import { NextResponse } from 'next/server'

const HEADERS = { 'User-Agent': 'Mozilla/5.0' }

async function fetchHistory(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 900 } })
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) return []
  const timestamps: number[] = result.timestamp ?? []
  const ohlcv = result.indicators?.quote?.[0] ?? {}
  return timestamps
    .map((ts, i) => ({
      time:   ts,
      open:   ohlcv.open?.[i]   ?? null,
      high:   ohlcv.high?.[i]   ?? null,
      low:    ohlcv.low?.[i]    ?? null,
      close:  ohlcv.close?.[i]  ?? null,
      volume: ohlcv.volume?.[i] ?? 0,
    }))
    .filter((c) => c.close !== null)
}

function calcEMA(candles: { close: number }[], period: number): number[] {
  const k = 2 / (period + 1)
  const emas: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { emas.push(candles[0].close); continue }
    emas.push(candles[i].close * k + emas[i - 1] * (1 - k))
  }
  return emas
}

function calcSMA(candles: { close: number }[], period: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null
    const slice = candles.slice(i - period + 1, i + 1)
    return slice.reduce((s, c) => s + c.close, 0) / period
  })
}

async function fetchEarnings() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const url = `https://query1.finance.yahoo.com/v1/finance/calendar/earnings?startdt=${today}&enddt=${today}&size=8`
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } })
    const data = await res.json()
    const items = data?.earnings?.earningsCalendar ?? []
    return items.slice(0, 8).map((e: any) => ({
      symbol:   e.ticker,
      company:  e.companyshortname,
      epsEst:   e.epsestimate,
      time:     e.startdatetimetype, // 'BMO' before market open, 'AMC' after market close
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const [spyData, vixData, earnings] = await Promise.all([
    fetchHistory('SPY', '3mo', '1d'),
    fetchHistory('^VIX', '5d',  '1d'),
    fetchEarnings(),
  ])

  // --- VIX ---
  const vixLast  = vixData.length > 0 ? vixData[vixData.length - 1].close : null
  const vixPrev  = vixData.length > 1 ? vixData[vixData.length - 2].close : null
  const vixChange = vixLast && vixPrev ? parseFloat((vixLast - vixPrev).toFixed(2)) : null

  // Fear level
  let fearLevel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' = 'Neutral'
  if (vixLast !== null) {
    if (vixLast >= 35)      fearLevel = 'Extreme Fear'
    else if (vixLast >= 25) fearLevel = 'Fear'
    else if (vixLast >= 18) fearLevel = 'Neutral'
    else if (vixLast >= 12) fearLevel = 'Greed'
    else                    fearLevel = 'Extreme Greed'
  }

  // --- Días consecutivos al alza / baja SPY ---
  let consecutiveDays = 0
  let direction: 'up' | 'down' | 'flat' = 'flat'
  if (spyData.length >= 2) {
    const last = spyData[spyData.length - 1]
    const prev = spyData[spyData.length - 2]
    direction = last.close > prev.close ? 'up' : last.close < prev.close ? 'down' : 'flat'

    for (let i = spyData.length - 1; i >= 1; i--) {
      const curr = spyData[i]
      const before = spyData[i - 1]
      const isUp   = curr.close > before.close
      const isDown = curr.close < before.close
      if (direction === 'up'   && isUp)   { consecutiveDays++; continue }
      if (direction === 'down' && isDown) { consecutiveDays++; continue }
      break
    }
  }

  // --- EMA 8 / EMA 21 para SPY ---
  const ema8arr  = calcEMA(spyData as any, 8)
  const ema21arr = calcEMA(spyData as any, 21)
  const spyClose = spyData.length > 0 ? spyData[spyData.length - 1].close : null
  const ema8     = ema8arr.length  > 0 ? parseFloat(ema8arr[ema8arr.length - 1].toFixed(2))   : null
  const ema21    = ema21arr.length > 0 ? parseFloat(ema21arr[ema21arr.length - 1].toFixed(2)) : null
  const aboveEMA8  = spyClose !== null && ema8  !== null ? spyClose > ema8  : null
  const aboveEMA21 = spyClose !== null && ema21 !== null ? spyClose > ema21 : null

  // --- % días sobre SMA20 y SMA50 (rolling, últimas 60 velas) ---
  const sma20arr = calcSMA(spyData as any, 20)
  const sma50arr = calcSMA(spyData as any, 50)
  const window   = spyData.slice(-60)
  const wStart   = spyData.length - 60

  let daysAboveSMA20 = 0, daysAboveSMA50 = 0
  window.forEach((c, i) => {
    const idx = wStart + i
    if (sma20arr[idx] !== null && c.close > sma20arr[idx]!) daysAboveSMA20++
    if (sma50arr[idx] !== null && c.close > sma50arr[idx]!) daysAboveSMA50++
  })
  const pctAboveSMA20 = parseFloat(((daysAboveSMA20 / window.length) * 100).toFixed(1))
  const pctAboveSMA50 = parseFloat(((daysAboveSMA50 / window.length) * 100).toFixed(1))

  // --- New Highs / New Lows (52 semanas en SPY) ---
  const year = spyData.slice(-252)
  const yearHigh = Math.max(...year.map((c) => c.high ?? 0))
  const yearLow  = Math.min(...year.map((c) => c.low  ?? Infinity))
  const lastClose = spyData.length > 0 ? spyData[spyData.length - 1].close : null
  const isNewHigh = lastClose !== null ? lastClose >= yearHigh * 0.995 : false
  const isNewLow  = lastClose !== null ? lastClose <= yearLow  * 1.005 : false

  return NextResponse.json({
    vix: { value: vixLast, change: vixChange, fearLevel },
    consecutiveDays: { count: consecutiveDays, direction },
    ema: { ema8, ema21, spyClose, aboveEMA8, aboveEMA21 },
    sma: { pctAboveSMA20, pctAboveSMA50 },
    yearRange: { high: parseFloat(yearHigh.toFixed(2)), low: parseFloat(yearLow.toFixed(2)), isNewHigh, isNewLow },
    earnings,
    updatedAt: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=60' },
  })
}
