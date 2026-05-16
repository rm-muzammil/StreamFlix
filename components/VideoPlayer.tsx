'use client'
import { useHlsPlayer }    from '@/hooks/useHlsPlayer'
import StreamMetrics        from './StreamMetrics'
import QualitySelector      from './QualitySelector'

export default function VideoPlayer({ src }: { src: string }) {
  const { videoRef, metrics, setLevel } = useHlsPlayer(src)

  return (
    <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto">
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg bg-black aspect-video"
      />
      <div className="flex items-center justify-between px-1">
        <StreamMetrics metrics={metrics} />
        <QualitySelector
          levels={metrics.levels}
          currentLevel={metrics.currentLevel}
          onSelect={setLevel}
        />
      </div>
    </div>
  )
}
