export interface Trade {
  date: string
  ticker: string
  side: 'LONG' | 'SHORT'
  entry: number
  exit: number
  ejecucion: number  // 1-10
  timing: number     // 1-10
  riesgo: number     // 1-10
  notes?: string
}

export const MOCK_TRADES: Trade[] = [
  { date: '2025-04-01', ticker: 'SPY',  side: 'LONG',  entry: 508.50, exit: 514.20, ejecucion: 8, timing: 7, riesgo: 9, notes: 'Rebote en soporte clave' },
  { date: '2025-04-01', ticker: 'QQQ',  side: 'LONG',  entry: 432.10, exit: 438.75, ejecucion: 7, timing: 8, riesgo: 8, notes: 'Breakout con volumen' },
  { date: '2025-04-02', ticker: 'XLK',  side: 'LONG',  entry: 210.30, exit: 207.80, ejecucion: 6, timing: 5, riesgo: 7, notes: 'Stop activado, salida correcta' },
  { date: '2025-04-03', ticker: 'IWM',  side: 'SHORT', entry: 203.50, exit: 198.20, ejecucion: 9, timing: 9, riesgo: 9, notes: 'Estructura bajista clara' },
  { date: '2025-04-04', ticker: 'SPY',  side: 'LONG',  entry: 510.00, exit: 516.40, ejecucion: 8, timing: 7, riesgo: 8 },
  { date: '2025-04-07', ticker: 'XLE',  side: 'SHORT', entry: 93.20,  exit: 89.50,  ejecucion: 7, timing: 8, riesgo: 7, notes: 'Debilidad sectorial' },
  { date: '2025-04-07', ticker: 'QQQ',  side: 'LONG',  entry: 435.50, exit: 433.10, ejecucion: 5, timing: 4, riesgo: 7, notes: 'Entrada prematura' },
  { date: '2025-04-08', ticker: 'DIA',  side: 'LONG',  entry: 385.20, exit: 390.60, ejecucion: 8, timing: 8, riesgo: 9 },
]

export function calcTradeStats(trades: Trade[]) {
  const results = trades.map((t) => {
    const plRaw = t.side === 'LONG' ? t.exit - t.entry : t.entry - t.exit
    const plPct = (plRaw / t.entry) * 100
    const score = parseFloat(((t.ejecucion + t.timing + t.riesgo) / 3).toFixed(1))
    return { ...t, plRaw, plPct, score, isWin: plRaw > 0 }
  })

  const wins = results.filter((r) => r.isWin).length
  const winRate = parseFloat(((wins / results.length) * 100).toFixed(1))
  const avgScore = parseFloat((results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1))
  const totalPL = parseFloat(results.reduce((s, r) => s + r.plRaw, 0).toFixed(2))

  return { results, winRate, avgScore, totalPL }
}
