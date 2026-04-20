import { NextResponse } from 'next/server'

// Bulk quotes para múltiples tickers (usado por el portafolio)
export async function POST(req: Request) {
  try {
    const { tickers } = await req.json()
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({}, { status: 400 })
    }

    const unique = Array.from(new Set(tickers.map((t: string) => t.toUpperCase())))

    const results = await Promise.allSettled(
      unique.map(async (symbol) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 300 },
        })
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (!meta) return null
        return {
          symbol,
          price: meta.regularMarketPrice ?? 0,
          prev:  meta.chartPreviousClose ?? meta.previousClose ?? 0,
        }
      })
    )

    const quotes: Record<string, { price: number; prev: number }> = {}
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) {
        quotes[r.value.symbol] = { price: r.value.price, prev: r.value.prev }
      }
    })

    return NextResponse.json({ quotes })
  } catch (e) {
    console.error('[quotes]', e)
    return NextResponse.json({ error: 'Error al obtener quotes' }, { status: 500 })
  }
}
