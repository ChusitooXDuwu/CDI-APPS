'use client'

import { MOCK_TRADES, calcTradeStats } from '@/lib/mockTrades'

export default function TradesSection() {
  const { results, winRate, avgScore, totalPL } = calcTradeStats(MOCK_TRADES)
  const isPLPositive = totalPL >= 0

  return (
    <div className="space-y-6">
      <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-warning text-sm">
        Mostrando trades de ejemplo. Conecta Google Sheets o Supabase en v2 para datos reales.
      </div>

      {/* Stats resumen */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Score promedio" value={`${avgScore}/10`} positive />
        <StatCard label="Win Rate" value={`${winRate}%`} positive={winRate >= 50} />
        <StatCard
          label="P&L acumulado"
          value={`${isPLPositive ? '+' : ''}$${totalPL.toFixed(2)}`}
          positive={isPLPositive}
        />
      </div>

      {/* Tabla de trades */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E1E22] text-muted text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-body font-normal">Fecha</th>
              <th className="text-left pb-3 font-body font-normal">Ticker</th>
              <th className="text-left pb-3 font-body font-normal">Side</th>
              <th className="text-right pb-3 font-body font-normal">Entry</th>
              <th className="text-right pb-3 font-body font-normal">Exit</th>
              <th className="text-right pb-3 font-body font-normal">P&L</th>
              <th className="text-right pb-3 font-body font-normal">Score</th>
              <th className="text-right pb-3 font-body font-normal">Ejec.</th>
              <th className="text-right pb-3 font-body font-normal">Timing</th>
              <th className="text-right pb-3 font-body font-normal">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {results.map((t, i) => (
              <tr
                key={i}
                className="border-b border-[#1E1E22] hover:bg-surface/50 transition-colors"
              >
                <td className="py-3 font-mono text-xs text-muted">{t.date}</td>
                <td className="py-3 font-display font-semibold">{t.ticker}</td>
                <td className="py-3">
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      t.side === 'LONG'
                        ? 'text-positive bg-positive/10'
                        : 'text-negative bg-negative/10'
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="py-3 text-right font-mono">${t.entry.toFixed(2)}</td>
                <td className="py-3 text-right font-mono">${t.exit.toFixed(2)}</td>
                <td className={`py-3 text-right font-mono font-semibold ${t.isWin ? 'text-positive' : 'text-negative'}`}>
                  {t.isWin ? '+' : ''}{t.plRaw.toFixed(2)}
                </td>
                <td className="py-3 text-right font-mono font-semibold text-accent">
                  {t.score}
                </td>
                <td className="py-3 text-right font-mono text-muted">{t.ejecucion}</td>
                <td className="py-3 text-right font-mono text-muted">{t.timing}</td>
                <td className="py-3 text-right font-mono text-muted">{t.riesgo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="bg-surface border border-[#1E1E22] rounded-xl p-4">
      <p className="text-xs text-muted uppercase tracking-wider font-body">{label}</p>
      <p className={`text-2xl font-mono font-semibold mt-2 ${positive ? 'text-positive' : 'text-negative'}`}>
        {value}
      </p>
    </div>
  )
}
