import VideoPlayer from '@/components/VideoPlayer'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <VideoPlayer src="/hls_content/b90a2a84/master.m3u8" />
    </main>
  )
}
