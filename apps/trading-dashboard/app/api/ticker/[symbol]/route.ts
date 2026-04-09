import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.toUpperCase()

  try {
    // Info general + precio actual
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    // Histórico 6 meses para el chart de velas
    const histUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`

    const [quoteRes, histRes] = await Promise.all([
      fetch(quoteUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 900 } }),
      fetch(histUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 900 } }),
    ])

    const [quoteData, histData] = await Promise.all([
      quoteRes.json(),
      histRes.json(),
    ])

    const meta = quoteData?.chart?.result?.[0]?.meta
    if (!meta) {
      return NextResponse.json({ error: 'Ticker no encontrado' }, { status: 404 })
    }

    // Datos del chart de velas
    const result = histData?.chart?.result?.[0]
    const timestamps: number[] = result?.timestamp ?? []
    const ohlcv = result?.indicators?.quote?.[0] ?? {}

    const candles = timestamps
      .map((ts: number, i: number) => ({
        time: ts as number,
        open: ohlcv.open?.[i] ?? null,
        high: ohlcv.high?.[i] ?? null,
        low: ohlcv.low?.[i] ?? null,
        close: ohlcv.close?.[i] ?? null,
        volume: ohlcv.volume?.[i] ?? 0,
      }))
      .filter((c) => c.open !== null && c.close !== null)

    const price = meta.regularMarketPrice ?? 0
    const prev = meta.chartPreviousClose ?? 0
    const change = parseFloat((price - prev).toFixed(2))
    const changePct = prev > 0 ? parseFloat(((change / prev) * 100).toFixed(2)) : 0

    return NextResponse.json({
      symbol,
      name: meta.longName ?? meta.shortName ?? symbol,
      price,
      change,
      changePct,
      prev,
      volume: meta.regularMarketVolume ?? 0,
      high52w: meta.fiftyTwoWeekHigh ?? null,
      low52w: meta.fiftyTwoWeekLow ?? null,
      marketCap: meta.marketCap ?? null,
      currency: meta.currency ?? 'USD',
      exchange: meta.exchangeName ?? '',
      candles,
    }, {
      headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=60' },
    })
  } catch (e) {
    console.error('[ticker]', e)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
