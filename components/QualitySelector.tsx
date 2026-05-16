import { Level } from 'hls.js'

interface Props {
  levels:       Level[]
  currentLevel: number
  onSelect:     (level: number) => void
}

export default function QualitySelector({ levels, currentLevel, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 font-mono">quality</span>
      <select
        className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700"
        value={currentLevel}
        onChange={e => onSelect(Number(e.target.value))}
      >
        <option value={-1}>Auto</option>
        {levels.map((l, i) => (
          <option key={i} value={i}>{l.height}p</option>
        ))}
      </select>
    </div>
  )
}
