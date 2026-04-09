import Link from 'next/link'

interface MarketCardProps {
  symbol: string
  label: string
  price: number
  change: number
  changePct: number
  volume?: number
  isMock?: boolean
}

export default function MarketCard({
  symbol,
  label,
  price,
  change,
  changePct,
  volume,
  isMock,
}: MarketCardProps) {
  const isPositive = changePct >= 0

  return (
    <Link href={`/ticker/${symbol}`}>
      <div className="relative bg-surface border border-[#1E1E22] rounded-xl p-4 flex flex-col gap-2 hover:border-accent/40 hover:bg-surface/80 transition-all cursor-pointer">
        {isMock && (
          <span className="absolute top-2 right-2 text-[10px] text-warning font-mono bg-warning/10 px-1.5 py-0.5 rounded">
            DEMO
          </span>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wider">{label}</p>
            <p className="text-sm font-display font-semibold text-white/80 mt-0.5">{symbol}</p>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-1 rounded-md ${
              isPositive
                ? 'text-positive bg-positive/10'
                : 'text-negative bg-negative/10'
            }`}
          >
            {isPositive ? '+' : ''}{changePct.toFixed(2)}%
          </span>
        </div>

        <div className="mt-1">
          <p className="text-2xl font-mono font-semibold text-white">
            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-mono mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}
          </p>
        </div>

        {volume !== undefined && (
          <p className="text-xs text-muted font-mono mt-1">
            Vol: {(volume / 1_000_000).toFixed(1)}M
          </p>
        )}
      </div>
    </Link>
  )
}
