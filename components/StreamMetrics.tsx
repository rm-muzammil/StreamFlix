import { PlayerMetrics } from '@/hooks/useHlsPlayer'

const fmt = (bps: number) => {
  if (bps === 0)         return '...'
  if (bps > 1_000_000)  return `${(bps / 1_000_000).toFixed(1)} Mbps`
  return `${Math.round(bps / 1000)} kbps`
}

const bufferColor = (s: number) => {
  if (s > 15) return 'text-green-400'
  if (s > 5)  return 'text-yellow-400'
  return 'text-red-400'       // under 5s buffer = danger zone
}

export default function StreamMetrics({ metrics }: { metrics: PlayerMetrics }) {
  const level = metrics.levels[metrics.currentLevel]

  return (
    <div className="flex gap-6 px-3 py-2 bg-black/70 text-xs font-mono rounded">
      <span>
        <span className="text-zinc-500">bandwidth </span>
        <span className="text-white">{fmt(metrics.bandwidth)}</span>
      </span>
      <span>
        <span className="text-zinc-500">buffer </span>
        <span className={bufferColor(metrics.bufferHealth)}>
          {metrics.bufferHealth}s
        </span>
      </span>
      <span>
        <span className="text-zinc-500">quality </span>
        <span className="text-white">
          {level ? `${level.height}p` : 'detecting...'}
        </span>
      </span>
    </div>
  )
}
