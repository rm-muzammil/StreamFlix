import { useEffect, useRef, useState } from 'react'
import Hls, { Level } from 'hls.js'

export interface PlayerMetrics {
  bandwidth: number        // bits per second, measured by hls.js
  bufferHealth: number     // seconds of video buffered ahead
  currentLevel: number     // -1 = auto, 0 = 360p, 1 = 720p, 2 = 1080p
  autoLevel: number        // what ABR would pick right now
  levels: Level[]          // all available quality levels
}

export function useHlsPlayer(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<Hls | null>(null)

  const [metrics, setMetrics] = useState<PlayerMetrics>({
    bandwidth:    0,
    bufferHealth: 0,
    currentLevel: -1,
    autoLevel:    -1,
    levels:       [],
  })

  // Update buffer health every second — reads from the video element directly
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current
      const hls   = hlsRef.current
      if (!video || !hls) return

      // video.buffered is a TimeRanges object — find the range containing currentTime
      let bufferHealth = 0
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime &&
            video.currentTime   <= video.buffered.end(i)) {
          bufferHealth = video.buffered.end(i) - video.currentTime
          break
        }
      }

      setMetrics(prev => ({
        ...prev,
        bufferHealth: Math.round(bufferHealth * 10) / 10,
        bandwidth:    Math.round(hls.bandwidthEstimate),
        autoLevel:    hls.nextAutoLevel,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Init hls.js and attach event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!Hls.isSupported()) {
      // Safari supports HLS natively
      video.src = src
      return
    }

    const hls = new Hls({
      // Start at lowest quality, let ABR move up — safer for real networks
      startLevel: -1,
    })
    hlsRef.current = hls

    hls.loadSource(src)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      setMetrics(prev => ({ ...prev, levels: data.levels }))
      video.play().catch(() => {}) // autoplay may be blocked, that's fine
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      setMetrics(prev => ({ ...prev, currentLevel: data.level }))
    })

    hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
      // FRAG_LOADED fires after every segment download
      // data.frag has: duration, url, level
      // data.stats has: loaded (bytes), loading.start, loading.end
      const bytes    = data.stats.loaded
      const ms       = data.stats.loading.end - data.stats.loading.start
      const bps      = Math.round((bytes * 8) / (ms / 1000))
      setMetrics(prev => ({ ...prev, bandwidth: bps }))
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      // Only fatal errors need recovery — non-fatal are handled automatically
      if (data.fatal) {
        console.error('Fatal HLS error:', data.type, data.details)
        hls.recoverMediaError()
      }
    })

    return () => {
      hls.destroy()
      hlsRef.current = null
    }
  }, [src])

  // Expose a function to manually set quality level
  const setLevel = (level: number) => {
    if (!hlsRef.current) return
    hlsRef.current.currentLevel = level
    setMetrics(prev => ({ ...prev, currentLevel: level }))
  }

  return { videoRef, metrics, setLevel }
}
