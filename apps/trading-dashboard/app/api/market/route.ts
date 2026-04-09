import { NextResponse } from 'next/server'

const TICKERS = {
  indices: ['SPY', 'QQQ', 'DIA', 'IWM'],
  sectors: ['XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLC', 'XLY', 'XLRE'],
}

const TICKER_LABELS: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
  XLK: 'Tecnología',
  XLF: 'Financiero',
  XLE: 'Energía',
  XLV: 'Salud',
  XLI: 'Industrial',
  XLC: 'Comunicación',
  XLY: 'Consumo Discr.',
  XLRE: 'Real Estate',
}

async function fetchQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    next: { revalidate: 900 }, // cache 15 min
  })

  if (!res.ok) {
    console.log(`[market] ${symbol}: HTTP ${res.status}`)
    return null
  }

  const data = await res.json()
  const meta = data?.chart?.result?.[0]?.meta

  if (!meta) {
    console.log(`[market] ${symbol}: sin meta en respuesta`)
    return null
  }

  const price = meta.regularMarketPrice ?? 0
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0
  const change = parseFloat((price - prev).toFixed(2))
  const changePct = prev > 0 ? parseFloat(((change / prev) * 100).toFixed(2)) : 0
  const volume = meta.regularMarketVolume ?? 0

  return {
    symbol,
    label: TICKER_LABELS[symbol] ?? symbol,
    price,
    change,
    changePct,
    prev,
    volume,
  }
}

function getMockQuote(symbol: string) {
  const mockData: Record<string, { price: number; changePct: number }> = {
    SPY: { price: 512.34, changePct: 0.42 },
    QQQ: { price: 438.21, changePct: 0.67 },
    DIA: { price: 387.55, changePct: 0.18 },
    IWM: { price: 201.14, changePct: -0.31 },
    XLK: { price: 214.67, changePct: 0.89 },
    XLF: { price: 42.33, changePct: 0.22 },
    XLE: { price: 91.45, changePct: -0.55 },
    XLV: { price: 141.20, changePct: 0.11 },
    XLI: { price: 125.88, changePct: 0.34 },
    XLC: { price: 88.50, changePct: 1.02 },
    XLY: { price: 183.77, changePct: -0.18 },
    XLRE: { price: 37.42, changePct: -0.67 },
  }
  const d = mockData[symbol] ?? { price: 100, changePct: 0 }
  const change = parseFloat((d.price * d.changePct / 100).toFixed(2))
  return {
    symbol,
    label: TICKER_LABELS[symbol] ?? symbol,
    price: d.price,
    change,
    changePct: d.changePct,
    prev: parseFloat((d.price - change).toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 5000000,
    isMock: true,
  }
}

export async function GET() {
  const allTickers = [...TICKERS.indices, ...TICKERS.sectors]

  const settled = await Promise.allSettled(
    allTickers.map((t) => fetchQuote(t))
  )

  const results = settled.map((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      console.log(`[market] ${allTickers[i]}: OK — $${r.value.price}`)
      return r.value
    }
    console.log(`[market] ${allTickers[i]}: falló — usando mock`)
    return getMockQuote(allTickers[i])
  })

  const indices = results.filter((r) => TICKERS.indices.includes(r.symbol))
  const sectors = results.filter((r) => TICKERS.sectors.includes(r.symbol))

  return NextResponse.json(
    { indices, sectors, updatedAt: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 's-maxage=900, stale-while-revalidate=60',
      },
    }
  )
}
