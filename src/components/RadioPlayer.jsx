import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildReadQueue, resolveReadItemSegments } from '../lib/radioPlaylist.js'
import { BIBLE_BOOKS } from '../lib/bibleCatalog.js'

/**
 * Verse News Read — continuous free TTS of Bible chapters and/or articles.
 * Minimizable while playing; Bible book/chapter selectable.
 */
export default function RadioPlayer({ stories = [], onOpenStory, openBibleReference }) {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [itemIdx, setItemIdx] = useState(0)
  const [segIdx, setSegIdx] = useState(0)
  const [status, setStatus] = useState('Ready')
  const [engine, setEngine] = useState('free')
  const [feed, setFeed] = useState('both') // bible | articles | both
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState('')
  const [segLabel, setSegLabel] = useState('')

  // Bible picker
  const [pickBook, setPickBook] = useState('john')
  const [pickChapter, setPickChapter] = useState(1)
  const [bibleAnchor, setBibleAnchor] = useState(null) // { book, chapter } applied to queue

  const audioRef = useRef(null)
  const objectUrlRef = useRef(null)
  const playingRef = useRef(false)
  const queueRef = useRef({ items: [] })
  const itemIdxRef = useRef(0)
  const segIdxRef = useRef(0)
  const segmentsCacheRef = useRef(new Map())
  const abortRef = useRef(null)
  const utterRef = useRef(null)
  const engineRef = useRef('free')
  const voiceURIRef = useRef('')
  const loopGenRef = useRef(0)

  const speechOk = typeof window !== 'undefined' && 'speechSynthesis' in window

  const pickBookMeta = useMemo(
    () => BIBLE_BOOKS.find((b) => b[0] === pickBook) || BIBLE_BOOKS[42],
    [pickBook],
  )
  const pickChapterMax = pickBookMeta[2] || 1

  const program = useMemo(
    () => buildReadQueue(stories, new Date(), feed, 80, {
      bibleBook: bibleAnchor?.book || (feed !== 'articles' ? pickBook : ''),
      bibleChapter: bibleAnchor?.chapter || (feed !== 'articles' ? pickChapter : 0),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories?.length, stories?.[0]?.id, feed, bibleAnchor?.book, bibleAnchor?.chapter],
  )

  useEffect(() => {
    queueRef.current = program
    itemIdxRef.current = 0
    segIdxRef.current = 0
    segmentsCacheRef.current = new Map()
    setItemIdx(0)
    setSegIdx(0)
    setSegLabel('')
  }, [program])

  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { engineRef.current = engine }, [engine])
  useEffect(() => { voiceURIRef.current = voiceURI }, [voiceURI])

  useEffect(() => {
    if (!speechOk) return undefined
    const pickAllowed = (list) => {
      const all = list || []
      const names = ['tessa', 'daniel', 'karen']
      const picked = []
      for (const name of names) {
        const match = all.find((v) => new RegExp(`\\b${name}\\b`, 'i').test(v.name || ''))
        if (match) picked.push(match)
      }
      return picked
    }
    const load = () => {
      const allowed = pickAllowed(window.speechSynthesis.getVoices() || [])
      setVoices(allowed)
      if (!allowed.length) return
      const stillValid = allowed.some((v) => v.voiceURI === voiceURIRef.current)
      if (!stillValid) {
        const preferred =
          allowed.find((v) => /daniel/i.test(v.name)) ||
          allowed.find((v) => /tessa/i.test(v.name)) ||
          allowed[0]
        setVoiceURI(preferred.voiceURI)
      }
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [speechOk])

  // Clamp chapter when book changes
  useEffect(() => {
    if (pickChapter > pickChapterMax) setPickChapter(1)
  }, [pickBook, pickChapter, pickChapterMax])

  const currentItem = program.items[itemIdx] || null

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    utterRef.current = null
  }, [])

  const cleanupAudio = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    stopSpeech()
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.removeAttribute('src')
      try { audio.load() } catch { /* ignore */ }
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [stopSpeech])

  useEffect(() => () => cleanupAudio(), [cleanupAudio])

  const speakFree = useCallback((text) => new Promise((resolve, reject) => {
    if (!speechOk) {
      reject(new Error('This browser has no free speech engine. Try Chrome or Edge.'))
      return
    }
    stopSpeech()
    try { window.speechSynthesis.resume() } catch { /* ignore */ }

    const u = new SpeechSynthesisUtterance(text)
    utterRef.current = u
    u.rate = 0.95
    u.pitch = 1
    u.volume = 1
    const list = window.speechSynthesis.getVoices() || []
    const allowed = list.filter((v) => /tessa|daniel|karen/i.test(v.name || ''))
    const chosen =
      allowed.find((v) => v.voiceURI === voiceURIRef.current) ||
      allowed.find((v) => /daniel/i.test(v.name)) ||
      allowed.find((v) => /tessa/i.test(v.name)) ||
      allowed[0]
    if (chosen) u.voice = chosen
    u.lang = chosen?.lang || 'en-US'

    u.onend = () => resolve()
    u.onerror = (e) => {
      if (e?.error === 'interrupted' || e?.error === 'canceled') {
        resolve()
        return
      }
      reject(new Error(e?.error || 'Speech failed'))
    }
    window.speechSynthesis.speak(u)
  }), [speechOk, stopSpeech])

  const speakStudio = useCallback(async (text) => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setStatus('Studio buffer…')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })
      if (!res.ok) {
        let msg = `Studio error (${res.status})`
        try {
          const j = await res.json()
          if (j?.error) msg = j.error
        } catch { /* ignore */ }
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      const audio = audioRef.current || new Audio()
      audioRef.current = audio
      audio.src = url
      await new Promise((resolve, reject) => {
        audio.onended = () => resolve()
        audio.onerror = () => reject(new Error('Audio playback failed'))
        const p = audio.play()
        if (p?.then) p.catch((err) => reject(err || new Error('Playback blocked — tap Play again')))
      })
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [])

  const speakSegment = useCallback(async (text) => {
    cleanupAudio()
    setError('')
    if (engineRef.current === 'studio') {
      try {
        await speakStudio(text)
      } catch (err) {
        setError(`${err.message} — switched to free voice.`)
        setEngine('free')
        engineRef.current = 'free'
        setStatus('Free voice')
        await speakFree(text)
      }
    } else {
      setLoading(false)
      await speakFree(text)
    }
  }, [cleanupAudio, speakFree, speakStudio])

  const getSegmentsForItem = useCallback(async (item) => {
    if (!item) return []
    const cached = segmentsCacheRef.current.get(item.id)
    if (cached?.length) return cached
    setLoading(true)
    setStatus(item.kind === 'bible' ? `Loading ${item.ref}…` : 'Loading report…')
    try {
      const segs = await resolveReadItemSegments(item)
      segmentsCacheRef.current.set(item.id, segs)
      return segs
    } finally {
      setLoading(false)
    }
  }, [])

  const advance = useCallback(() => {
    segIdxRef.current += 1
    setSegIdx(segIdxRef.current)
  }, [])

  const advanceItem = useCallback(() => {
    const items = queueRef.current.items || []
    if (!items.length) return
    const a = (itemIdxRef.current + 1) % items.length
    itemIdxRef.current = a
    segIdxRef.current = 0
    setItemIdx(a)
    setSegIdx(0)
    setSegLabel('')
  }, [])

  const runLoop = useCallback(async () => {
    const gen = ++loopGenRef.current
    const items = queueRef.current.items || []
    if (!items.length) {
      setError('Nothing in the read queue.')
      setPlaying(false)
      playingRef.current = false
      setStatus('Offline')
      return
    }

    while (playingRef.current && gen === loopGenRef.current) {
      const a = itemIdxRef.current
      const item = items[a]
      if (!item) {
        advanceItem()
        continue
      }

      let segs
      try {
        segs = await getSegmentsForItem(item)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load reading')
        await new Promise((r) => setTimeout(r, 900))
        if (!playingRef.current || gen !== loopGenRef.current) break
        advanceItem()
        continue
      }

      if (!segs.length) {
        advanceItem()
        continue
      }

      if (segIdxRef.current >= segs.length) {
        advanceItem()
        continue
      }

      const s = segIdxRef.current
      const seg = segs[s]
      setSegLabel(seg.label || '')
      setStatus(item.kind === 'bible' ? `Reading · ${item.ref}` : `Reading · ${item.ref || 'Report'}`)

      try {
        await speakSegment(seg.text)
      } catch (err) {
        if (err?.name === 'AbortError') break
        console.error(err)
        setError(err.message || 'Read failed')
        await new Promise((r) => setTimeout(r, 700))
        if (!playingRef.current || gen !== loopGenRef.current) break
        advance()
        continue
      }

      if (!playingRef.current || gen !== loopGenRef.current) break
      advance()
      await new Promise((r) => setTimeout(r, 200))
    }
  }, [advance, advanceItem, getSegmentsForItem, speakSegment])

  const start = () => {
    if (!program.items.length) {
      setError('Nothing in the read queue.')
      return
    }
    if (engine === 'free' && !speechOk) {
      setError('Free speech needs Chrome, Edge, or Safari on this device.')
      return
    }
    setError('')
    setPlaying(true)
    playingRef.current = true
    setStatus('Starting…')
    runLoop()
  }

  const stop = () => {
    setPlaying(false)
    playingRef.current = false
    loopGenRef.current += 1
    cleanupAudio()
    setStatus('Paused')
    setLoading(false)
  }

  const skip = () => {
    cleanupAudio()
    advanceItem()
    if (playingRef.current) runLoop()
  }

  const toggle = () => {
    if (playing) stop()
    else start()
  }

  /** Minimize panel; keep audio running */
  const minimize = () => {
    setOpen(false)
  }

  const changeFeed = (next) => {
    stop()
    setFeed(next)
    setError('')
  }

  const applyBibleSelection = () => {
    const ch = Math.min(Math.max(1, Number(pickChapter) || 1), pickChapterMax)
    setPickChapter(ch)
    setBibleAnchor({ book: pickBook, chapter: ch })
    stop()
    setError('')
    setStatus(`Queued from ${pickBookMeta[1]} ${ch}`)
  }

  const enVoices = voices
  const fabTitle = playing
    ? (currentItem?.headline || 'Reading…')
    : 'Verse News Read'

  if (!stories?.length && feed === 'articles') return null

  return (
    <>
      {/* Always-available launcher — playing continues when minimized */}
      {!open && (
        <button
          type="button"
          className={`vn-radio-fab${playing ? ' is-playing' : ''}`}
          onClick={() => setOpen(true)}
          aria-label={playing ? 'Expand Read player' : 'Open Verse News Read'}
          title={fabTitle}
        >
          <span className={`vn-radio-fab-icon${playing ? ' is-live' : ''}`} aria-hidden>
            {playing ? '♪' : '▶'}
          </span>
          <span className="vn-radio-fab-label">
            {playing ? 'Reading' : 'Read'}
          </span>
          {playing && currentItem && (
            <span className="vn-radio-fab-now">{(currentItem.ref || currentItem.headline || '').slice(0, 28)}</span>
          )}
        </button>
      )}

      {open && (
        <div className="vn-radio-panel" role="region" aria-label="Verse News Read">
          <header className="vn-radio-head">
            <div>
              <p className="vn-radio-kicker">
                Continuous read · {engine === 'free' ? 'Free browser voice' : 'ElevenLabs studio'}
              </p>
              <h2 className="vn-radio-title">Verse News Read</h2>
            </div>
            <div className="vn-radio-head-actions">
              <button
                type="button"
                className="vn-radio-min"
                onClick={minimize}
                aria-label="Minimize — keep playing"
                title="Minimize (keeps playing)"
              >
                –
              </button>
              <button
                type="button"
                className="vn-radio-close"
                onClick={() => { stop(); setOpen(false) }}
                aria-label="Stop and close"
                title="Stop and close"
              >
                ×
              </button>
            </div>
          </header>

          <div className="vn-radio-now">
            <span className="vn-radio-emoji" aria-hidden>{currentItem?.emoji || '📖'}</span>
            <div className="vn-radio-now-copy">
              <p className="vn-radio-status">
                <span className={`vn-radio-dot${playing ? ' is-live' : ''}`} />
                {loading ? 'Loading…' : status}
              </p>
              <strong className="vn-radio-headline">
                {currentItem?.headline || 'Choose a feed and press Play'}
              </strong>
              <p className="vn-radio-meta">
                {currentItem?.ref || '—'}
                {segLabel ? ` · ${segLabel}` : ''}
                {currentItem?.kind === 'bible' ? ' · Bible' : currentItem?.kind === 'article' ? ' · Report' : ''}
              </p>
            </div>
          </div>

          <div className="vn-radio-engine" role="group" aria-label="What to read">
            <label className="vn-radio-engine-label">
              <input type="radio" name="vn-read-feed" checked={feed === 'bible'} onChange={() => changeFeed('bible')} />
              Bible
            </label>
            <label className="vn-radio-engine-label">
              <input type="radio" name="vn-read-feed" checked={feed === 'articles'} onChange={() => changeFeed('articles')} />
              Reports
            </label>
            <label className="vn-radio-engine-label">
              <input type="radio" name="vn-read-feed" checked={feed === 'both'} onChange={() => changeFeed('both')} />
              Both
            </label>
          </div>

          {(feed === 'bible' || feed === 'both') && (
            <div className="vn-radio-bible-pick">
              <span className="vn-radio-bible-pick-label">Bible text</span>
              <div className="vn-radio-bible-row">
                <select
                  className="vn-radio-bible-select"
                  value={pickBook}
                  onChange={(e) => setPickBook(e.target.value)}
                  aria-label="Book"
                  disabled={playing}
                >
                  {BIBLE_BOOKS.map(([slug, name]) => (
                    <option key={slug} value={slug}>{name}</option>
                  ))}
                </select>
                <select
                  className="vn-radio-bible-chapter"
                  value={Math.min(pickChapter, pickChapterMax)}
                  onChange={(e) => setPickChapter(Number(e.target.value))}
                  aria-label="Chapter"
                  disabled={playing}
                >
                  {Array.from({ length: pickChapterMax }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="vn-radio-bible-go"
                  onClick={applyBibleSelection}
                  disabled={playing}
                >
                  Go
                </button>
              </div>
              <p className="vn-radio-note" style={{ marginTop: 6 }}>
                Starts at {pickBookMeta[1]} {Math.min(pickChapter, pickChapterMax)}, then continues through the Bible.
                {playing ? ' Pause to change selection.' : ''}
              </p>
            </div>
          )}

          <div className="vn-radio-engine" role="group" aria-label="Voice engine">
            <label className="vn-radio-engine-label">
              <input
                type="radio"
                name="vn-read-engine"
                checked={engine === 'free'}
                onChange={() => { stop(); setEngine('free'); setError('') }}
              />
              Free voice
            </label>
            <label className="vn-radio-engine-label">
              <input
                type="radio"
                name="vn-read-engine"
                checked={engine === 'studio'}
                onChange={() => { stop(); setEngine('studio'); setError('') }}
              />
              Studio
            </label>
          </div>

          {engine === 'free' && (
            <label className="vn-radio-voice">
              <span>Voice</span>
              {enVoices.length > 0 ? (
                <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)} disabled={playing}>
                  {enVoices.map((v) => {
                    const short = /tessa/i.test(v.name) ? 'Tessa' : /daniel/i.test(v.name) ? 'Daniel' : /karen/i.test(v.name) ? 'Karen' : v.name
                    return (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {short}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <p className="vn-radio-note" style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>
                  Tessa, Daniel, or Karen not found on this device.
                </p>
              )}
            </label>
          )}

          {error && <p className="vn-radio-error">{error}</p>}

          <div className="vn-radio-controls">
            <button
              type="button"
              className={`vn-radio-play${playing ? ' is-on' : ''}`}
              onClick={toggle}
              disabled={!program.items.length || loading}
              aria-label={playing ? 'Pause reading' : 'Start reading'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <button type="button" className="vn-radio-skip" onClick={skip} disabled={!program.items.length} aria-label="Next">
              ⏭ Next
            </button>
            <button type="button" className="vn-radio-skip" onClick={minimize} title="Minimize while playing">
              Minimize
            </button>
            {currentItem?.kind === 'article' && typeof onOpenStory === 'function' && (
              <button
                type="button"
                className="vn-radio-open"
                onClick={() => {
                  const story = stories.find((s) => String(s.id) === String(currentItem.storyId))
                  if (story) onOpenStory(story)
                }}
              >
                Open report
              </button>
            )}
            {currentItem?.kind === 'bible' && typeof openBibleReference === 'function' && (
              <button
                type="button"
                className="vn-radio-open"
                onClick={() => openBibleReference({
                  book: currentItem.book,
                  chapter: currentItem.chapter,
                  verse: 1,
                })}
              >
                Open Bible
              </button>
            )}
          </div>

          <p className="vn-radio-note">
            Minimize keeps audio going. × stops and closes.
            {' '}
            Free voice uses your browser — no cost.
          </p>
          <p className="vn-radio-note vn-radio-note-dim">
            {program.dayKey || '—'} · {program.items.length} in queue · loops
          </p>
        </div>
      )}
    </>
  )
}
