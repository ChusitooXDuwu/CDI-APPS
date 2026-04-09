import { NextResponse } from 'next/server'

const INTERVAL_MAP: Record<string, { interval: string; range: string }> = {
  '1D': { interval: '5m',  range: '1d' },
  '1W': { interval: '15m', range: '5d' },
  '1M': { interval: '1d',  range: '1mo' },
  '3M': { interval: '1d',  range: '3mo' },
  '6M': { interval: '1d',  range: '6mo' },
  '1Y': { interval: '1wk', range: '1y' },
  '5Y': { interval: '1mo', range: '5y' },
}

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.toUpperCase()
  const { searchParams } = new URL(req.url)
  const tf = searchParams.get('tf') ?? '6M'
  const { interval, range } = INTERVAL_MAP[tf] ?? INTERVAL_MAP['6M']

  try {
    const [quoteRes, histRes] = await Promise.all([
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } }
      ),
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
      ),
    ])

    const [quoteData, histData] = await Promise.all([quoteRes.json(), histRes.json()])

    const meta = quoteData?.chart?.result?.[0]?.meta
    if (!meta) {
      return NextResponse.json({ error: 'Ticker no encontrado' }, { status: 404 })
    }

    const result = histData?.chart?.result?.[0]
    const timestamps: number[] = result?.timestamp ?? []
    const ohlcv = result?.indicators?.quote?.[0] ?? {}

    const candles = timestamps
      .map((ts: number, i: number) => ({
        time: ts,
        open:   ohlcv.open?.[i]   ?? null,
        high:   ohlcv.high?.[i]   ?? null,
        low:    ohlcv.low?.[i]    ?? null,
        close:  ohlcv.close?.[i]  ?? null,
        volume: ohlcv.volume?.[i] ?? 0,
      }))
      .filter((c) => c.open !== null && c.close !== null && c.high !== null && c.low !== null)

    const price    = meta.regularMarketPrice ?? 0
    const prev     = meta.chartPreviousClose ?? 0
    const change   = parseFloat((price - prev).toFixed(2))
    const changePct = prev > 0 ? parseFloat(((change / prev) * 100).toFixed(2)) : 0

    return NextResponse.json({
      symbol,
      name:      meta.longName ?? meta.shortName ?? symbol,
      price,
      change,
      changePct,
      prev,
      volume:    meta.regularMarketVolume ?? 0,
      high52w:   meta.fiftyTwoWeekHigh ?? null,
      low52w:    meta.fiftyTwoWeekLow  ?? null,
      currency:  meta.currency   ?? 'USD',
      exchange:  meta.exchangeName ?? '',
      marketCap: meta.marketCap ?? null,
      candles,
      tf,
    }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    })
  } catch (e) {
    console.error('[ticker]', e)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
