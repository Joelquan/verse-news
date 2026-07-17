import React, { useMemo, useState } from 'react'

const FILTERS = [
  { key: 'all', label: 'All wire' },
  { key: 'creation', label: 'Science & nature' },
  { key: 'history', label: 'World & nations' },
  { key: 'biography', label: 'Faith & culture' },
  { key: 'livenews', label: 'General' },
]

/**
 * Full Live News desk — free real-world wire mixed by category tags.
 */
export default function LiveNewsPage({
  stories = [],
  onClose,
  onOpenStory,
  loading = false,
  sources = [],
  errors = [],
  onRefresh,
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const wire = useMemo(
    () => stories.filter((s) => s.isRealNews),
    [stories],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return wire.filter((s) => {
      if (filter !== 'all' && s.division !== filter) return false
      if (!q) return true
      const blob = [s.headline, s.summary, s.ref, s.location, s.movement].join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [wire, filter, query])

  return (
    <div style={{ background: '#f5f5f0', minHeight: '70vh' }}>
      <header
        style={{
          background: 'linear-gradient(120deg,#0b1c24 0 48%,#123 48% 70%,#1a3a32 70%)',
          color: '#fff',
          padding: 'clamp(20px,4vw,36px)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid rgba(255,255,255,.35)',
              background: 'rgba(0,0,0,.35)',
              color: '#fff',
              padding: '10px 14px',
              font: '900 10px Arial,sans-serif',
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            ← BACK TO NEWS
          </button>
          <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 2, color: '#7ddec8', marginTop: 18 }}>
            FREE WIRE · REAL-TIME
          </div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px,5vw,48px)',
              margin: '8px 0 10px',
              lineHeight: 1.05,
            }}
          >
            Live World News
          </h1>
          <p style={{ font: '15px/1.6 Arial,sans-serif', color: 'rgba(255,255,255,.8)', maxWidth: 720, margin: 0 }}>
            Contemporary reporting from free public sources, mixed into Verse News categories. Open any story for a
            full desk page — then read the original publisher for complete coverage.
          </p>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{ font: '800 12px Arial,sans-serif', color: '#ffd7a0' }}>
              {loading ? 'Loading wire…' : `${visible.length} stories`}
            </span>
            {sources.length > 0 && (
              <span style={{ font: '11px Arial,sans-serif', color: 'rgba(255,255,255,.55)' }}>
                Sources: {sources.join(' · ')}
              </span>
            )}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                style={{
                  border: '1px solid rgba(255,255,255,.3)',
                  background: 'rgba(255,255,255,.1)',
                  color: '#fff',
                  padding: '8px 12px',
                  font: '900 10px Arial,sans-serif',
                  letterSpacing: 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'REFRESHING…' : 'REFRESH WIRE'}
              </button>
            )}
          </div>
          {errors.length > 0 && (
            <div style={{ marginTop: 10, font: '11px Arial,sans-serif', color: '#ffb4b4' }}>
              Some sources unavailable: {errors.slice(0, 3).join(' · ')}
            </div>
          )}
        </div>
      </header>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(245,245,240,.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px clamp(12px,3vw,20px)', display: 'grid', gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search live wire…"
            aria-label="Search live news"
            style={{
              width: '100%',
              height: 44,
              border: '1px solid #bbb',
              padding: '0 14px',
              font: '16px Arial,sans-serif',
              background: '#fff',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  border: filter === f.key ? '1px solid #0d7377' : '1px solid #ccc',
                  background: filter === f.key ? '#0d7377' : '#fff',
                  color: filter === f.key ? '#fff' : '#222',
                  padding: '8px 12px',
                  font: '800 10px Arial,sans-serif',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px clamp(12px,3vw,20px) 72px' }}>
        {loading && wire.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#777', font: '15px Arial,sans-serif' }}>
            Fetching free news wires…
          </div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#777', font: '15px Arial,sans-serif' }}>
            No live stories match. Try another filter or refresh.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: 18,
            }}
          >
            {visible.map((s) => (
              <article
                key={s.id}
                onClick={() => onOpenStory(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenStory(s)
                  }
                }}
                role="button"
                tabIndex={0}
                style={{
                  background: '#fff',
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 280,
                }}
              >
                <div style={{ height: 150, background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 42,
                        background: 'linear-gradient(145deg,#0b1c24,#1a3a32)',
                      }}
                    >
                      {s.emoji || '📰'}
                    </div>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 10,
                      background: '#0d7377',
                      color: '#fff',
                      font: '900 9px Arial,sans-serif',
                      letterSpacing: 1,
                      padding: '3px 7px',
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1, color: '#0d7377' }}>
                    {s.ref} · {s.division}
                  </div>
                  <h2
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: 18,
                      lineHeight: 1.3,
                      margin: '8px 0 10px',
                      color: '#111',
                    }}
                  >
                    {s.headline}
                  </h2>
                  <p style={{ font: '13px/1.5 Arial,sans-serif', color: '#666', margin: 0, flex: 1 }}>
                    {(s.summary || '').slice(0, 140)}
                    {(s.summary || '').length > 140 ? '…' : ''}
                  </p>
                  <div style={{ marginTop: 12, font: '900 10px Arial,sans-serif', letterSpacing: 1, color: '#c00' }}>
                    OPEN DESK PAGE →
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
