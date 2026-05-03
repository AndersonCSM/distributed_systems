import { useEffect, useMemo, useRef, useState } from 'react'

const playlists = [
  { name: 'Deep Focus Engine', tracks: '52 faixas', accent: 'from-lime-300 to-lime-500' },
  { name: 'Night Coding', tracks: '31 faixas', accent: 'from-cyan-300 to-cyan-500' },
  { name: 'Lo-Fi Protocol', tracks: '44 faixas', accent: 'from-emerald-300 to-green-500' },
  { name: 'Distributed Beats', tracks: '27 faixas', accent: 'from-yellow-300 to-amber-500' },
]

const sampleTracks = [
  { title: 'Parallel Dreams', artist: 'Modular Kids', duration: '3:48' },
  { title: 'Heartbeat Queue', artist: 'Packet & Co', duration: '2:59' },
  { title: 'Late Deploy', artist: 'The Monoliths', duration: '4:13' },
  { title: 'Infinite Loop', artist: 'Aura Process', duration: '3:31' },
]

function parsePlaylistUrl(rawUrl, autoplay) {
  const input = rawUrl.trim()
  const value = input.includes('=') && !input.startsWith('http')
    ? input.slice(input.indexOf('=') + 1).trim()
    : input

  if (!value) {
    return { valid: false, reason: 'Insira um link para reproduzir.' }
  }

  if (value.startsWith('spotify:playlist:')) {
    const id = value.split(':').pop()
    if (!id) {
      return { valid: false, reason: 'Link do Spotify invalido.' }
    }

    return {
      valid: true,
      provider: 'spotify',
      embedUrl: `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`,
      note: 'No Spotify, o play pode exigir clique dentro do proprio embed.',
    }
  }

  if (value.startsWith('spotify:track:')) {
    const id = value.split(':').pop()
    if (!id) {
      return { valid: false, reason: 'Link do Spotify invalido.' }
    }

    return {
      valid: true,
      provider: 'spotify-track',
      embedUrl: `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`,
      note: 'Faixa do Spotify carregada. O play pode exigir clique dentro do embed.',
    }
  }

  let parsedUrl
  try {
    parsedUrl = new URL(value)
  } catch {
    return { valid: false, reason: 'URL invalida. Use um link completo.' }
  }

  const host = parsedUrl.hostname.replace('www.', '')

  if (/(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac)(\?|$)/i.test(parsedUrl.pathname)) {
    return {
      valid: true,
      provider: 'direct-audio',
      embedUrl: parsedUrl.toString(),
      note: 'Audio direto carregado. Use o Boost para aumentar o ganho.',
    }
  }

  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    const videoId = host.includes('youtu.be')
      ? parsedUrl.pathname.replace('/', '')
      : parsedUrl.searchParams.get('v')
    const listId = parsedUrl.searchParams.get('list')

    if (videoId) {
      const listQuery = listId ? `&list=${listId}` : ''
      return {
        valid: true,
        provider: 'youtube-video',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}${listQuery}&rel=0`,
        note: 'Video do YouTube pronto para reproduzir no botao Play.',
      }
    }

    if (!listId) {
      return { valid: false, reason: 'Para YouTube, use um link com v= (video) ou list= (playlist).' }
    }

    return {
      valid: true,
      provider: 'youtube-playlist',
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=${autoplay ? 1 : 0}&rel=0`,
      note: 'Playlist do YouTube pronta para reproduzir no botao Play.',
    }
  }

  if (host.includes('spotify.com')) {
    const match = parsedUrl.pathname.match(/\/(playlist|track)\/([a-zA-Z0-9]+)/)
    if (!match) {
      return { valid: false, reason: 'Link do Spotify deve ser de playlist ou faixa.' }
    }

    const mediaType = match[1]
    const mediaId = match[2]

    return {
      valid: true,
      provider: `spotify-${mediaType}`,
      embedUrl: `https://open.spotify.com/embed/${mediaType}/${mediaId}?utm_source=generator&theme=0`,
      note: 'No Spotify, o play pode exigir clique dentro do proprio embed.',
    }
  }

  return {
    valid: false,
    reason: 'Link nao suportado. Use YouTube ou Spotify.',
  }
}

function App() {
  const [playlistUrlInput, setPlaylistUrlInput] = useState('')
  const [activePlaylistUrl, setActivePlaylistUrl] = useState('')
  const [localAudio, setLocalAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [volumeBoost, setVolumeBoost] = useState(100)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const gainNodeRef = useRef(null)

  const parsedActivePlayer = useMemo(
    () => parsePlaylistUrl(activePlaylistUrl, isPlaying),
    [activePlaylistUrl, isPlaying],
  )

  const activePlayer = localAudio
    ? {
        valid: true,
        provider: 'direct-audio',
        embedUrl: localAudio.url,
        note: `Arquivo local carregado: ${localAudio.name}`,
      }
    : parsedActivePlayer

  const previewPlayer = useMemo(
    () => parsePlaylistUrl(playlistUrlInput, false),
    [playlistUrlInput],
  )

  useEffect(() => () => {
    if (localAudio?.isBlob) {
      window.URL.revokeObjectURL(localAudio.url)
    }
  }, [localAudio])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement || activePlayer.provider !== 'direct-audio') {
      return
    }

    if (!audioContextRef.current) {
      const Context = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new Context()
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement)
      gainNodeRef.current = audioContextRef.current.createGain()
      sourceNodeRef.current.connect(gainNodeRef.current)
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }

    audioElement.volume = 1
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volumeBoost / 100
    }
  }, [activePlayer.provider, activePlayer.embedUrl, volumeBoost])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement || activePlayer.provider !== 'direct-audio') {
      return
    }

    if (!isPlaying) {
      audioElement.pause()
      return
    }

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }

    audioElement.play().catch(() => {
      setIsPlaying(false)
    })
  }, [isPlaying, activePlayer.provider, activePlayer.embedUrl])

  const applyPlaylist = () => {
    setLocalAudio((current) => {
      if (current?.isBlob) {
        window.URL.revokeObjectURL(current.url)
      }
      return null
    })

    setActivePlaylistUrl(playlistUrlInput)
    setIsPlaying(false)
    setReloadKey((current) => current + 1)
  }

  const playPlaylist = () => {
    if (!activePlaylistUrl.trim() && !localAudio) {
      setActivePlaylistUrl(playlistUrlInput)
    }
    setIsPlaying(true)

    if (activePlayer.provider !== 'direct-audio') {
      setReloadKey((current) => current + 1)
    }
  }

  const stopPlaylist = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setReloadKey((current) => current + 1)
  }

  const loadLocalAudio = (event) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('audio/')) {
      return
    }

    const objectUrl = window.URL.createObjectURL(file)
    setLocalAudio((current) => {
      if (current?.isBlob) {
        window.URL.revokeObjectURL(current.url)
      }

      return {
        url: objectUrl,
        name: file.name,
        isBlob: true,
      }
    })

    setPlaylistUrlInput('')
    setActivePlaylistUrl('')
    setIsPlaying(false)
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(20,184,166,0.18),transparent_40%)]" />

      <main className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 gap-3 p-3 pb-32 lg:grid-cols-[280px_1fr_320px]">
        <aside className="panel fade-up rounded-2xl p-6 lg:block">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">VibeFlow</h1>
          <p className="mt-1 text-sm text-zinc-400">Sua trilha sonora para estudar</p>

          <nav className="mt-8 space-y-2 text-sm">
            {['Início', 'Buscar', 'Sua biblioteca'].map((item) => (
              <button
                key={item}
                type="button"
                className="w-full rounded-xl px-4 py-3 text-left font-semibold text-zinc-300 transition hover:bg-zinc-800/70 hover:text-white"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-lime-500/30 via-emerald-500/20 to-transparent p-4 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Sugestao do dia</p>
            <p className="mt-2 text-lg font-semibold text-white">Focus Sprint</p>
            <p className="mt-2 text-sm text-zinc-300">Mix de trilhas para ciclos de 25 minutos.</p>
          </div>
        </aside>

        <section className="panel fade-up rounded-2xl p-6" style={{ animationDelay: '120ms' }}>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">PLAYLIST CURADA</p>
              <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">Analog Study Session</h2>
              <p className="mt-3 max-w-2xl text-sm text-zinc-300">
                Cole um link de musica, video ou playlist e use o player para reproduzir na interface.
              </p>
            </div>
            <div className="w-full max-w-md space-y-2">
              <input
                type="url"
                placeholder="Ex: https://youtu.be/BFl_AvhXsOE ou list=https://youtu.be/BFl_AvhXsOE"
                value={playlistUrlInput}
                onChange={(event) => setPlaylistUrlInput(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none ring-lime-300/40 placeholder:text-zinc-500 focus:ring"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyPlaylist}
                  className="rounded-full bg-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-100 transition hover:bg-zinc-600"
                >
                  Carregar link
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-950 transition hover:bg-cyan-400"
                >
                  Arquivo local
                </button>
                <button
                  type="button"
                  onClick={playPlaylist}
                  className="rounded-full bg-lime-400 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-lime-300"
                >
                  Play
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={loadLocalAudio}
                className="hidden"
              />
            </div>
          </header>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {playlists.map((playlist, index) => (
              <article
                key={playlist.name}
                className="fade-up rounded-2xl bg-zinc-900/70 p-4 ring-1 ring-white/8 transition hover:-translate-y-1 hover:ring-lime-300/40"
                style={{ animationDelay: `${index * 100 + 160}ms` }}
              >
                <div className={`h-28 rounded-xl bg-gradient-to-br ${playlist.accent}`} />
                <h3 className="mt-4 text-base font-semibold text-white">{playlist.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{playlist.tracks}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/8">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Faixa</th>
                  <th className="px-4 py-3">Artista</th>
                  <th className="px-4 py-3 text-right">Duracao</th>
                </tr>
              </thead>
              <tbody>
                {sampleTracks.map((track) => (
                  <tr
                    key={track.title}
                    className="border-t border-white/5 bg-zinc-950/70 transition hover:bg-zinc-900/80"
                  >
                    <td className="px-4 py-3 font-medium text-white">{track.title}</td>
                    <td className="px-4 py-3 text-zinc-300">{track.artist}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{track.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel fade-up hidden rounded-2xl p-6 lg:block" style={{ animationDelay: '180ms' }}>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Link ativo</h3>

          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Status</p>
            <p className="mt-2 text-sm text-zinc-100">
              {activePlayer.valid ? 'Link carregado com sucesso.' : 'Aguardando link valido.'}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {activePlayer.valid ? activePlayer.note : previewPlayer.reason}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Links de exemplo</p>
            <ul className="mt-2 space-y-2 text-xs text-zinc-300">
              <li>Spotify: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</li>
              <li>Spotify faixa: https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl</li>
              <li>YouTube: https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj</li>
              <li>YouTube video: https://youtu.be/BFl_AvhXsOE</li>
              <li>Audio direto: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="fixed inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-zinc-900/85 px-4 py-4 backdrop-blur-xl lg:inset-x-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Player por link</p>
            <p className="text-xs text-zinc-400">
              {activePlayer.valid ? `Fonte: ${activePlayer.provider}` : 'Cole um link e clique em Carregar'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={applyPlaylist}
              className="rounded-full bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
            >
              Carregar
            </button>
            <button
              type="button"
              onClick={playPlaylist}
              className="rounded-full bg-lime-400 px-5 py-2 text-xs font-bold text-zinc-900 hover:bg-lime-300"
            >
              Play
            </button>
            <button
              type="button"
              onClick={stopPlaylist}
              className="rounded-full bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
            >
              Stop
            </button>
            <div className="w-36">
              <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                <span>Boost</span>
                <span className={volumeBoost > 140 ? 'text-amber-300' : 'text-zinc-400'}>{volumeBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={volumeBoost}
                onChange={(event) => setVolumeBoost(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-lime-400"
              />
            </div>
          </div>

          <div className="w-full md:max-w-[440px]">
            {activePlayer.valid && activePlayer.provider === 'direct-audio' ? (
              <audio
                ref={audioRef}
                src={activePlayer.embedUrl}
                controls
                className="h-20 w-full rounded-xl border border-white/10 bg-zinc-900"
                onEnded={() => setIsPlaying(false)}
              />
            ) : activePlayer.valid ? (
              <iframe
                key={`${reloadKey}-${activePlayer.embedUrl}`}
                src={activePlayer.embedUrl}
                title="playlist-player"
                className="h-20 w-full rounded-xl border border-white/10"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-5 text-xs text-zinc-400">
                {previewPlayer.reason}
              </div>
            )}
            {activePlayer.provider === 'direct-audio' && volumeBoost > 140 ? (
              <p className="mt-2 text-[11px] text-amber-300">
                Boost alto: o audio pode ficar estourado e distorcer.
              </p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
