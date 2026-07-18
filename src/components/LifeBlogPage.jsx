import React, { useMemo, useState } from 'react'
import { LIFE_NICHES, LIFE_BLOGS, getLifeBlogsByNiche } from '../data/lifeBlog.js'

/**
 * Life Desk — browse Christian living posts by everyday niche.
 */
export default function LifeBlogPage({ onClose, onOpenStory, initialNiche = 'all' }) {
  const [niche, setNiche] = useState(initialNiche || 'all')
  const [query, setQuery] = useState('')

  const posts = useMemo(() => {
    const base = getLifeBlogsByNiche(niche)
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter((p) => {
      const blob = [p.headline, p.summary, p.nicheLabel, p.ref, ...(p.body || [])].join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [niche, query])

  const active = LIFE_NICHES.find((n) => n.key === niche)

  return (
    <div style={{ background: '#f5f5f0', minHeight: '70vh' }}>
      <header
        style={{
          background: 'linear-gradient(115deg,#1a120c 0 46%,#3d2418 46% 72%,#2a1810 72%)',
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
          <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 2, color: '#e8b86d', marginTop: 18 }}>
            LIFE DESK · EVERYDAY ISSUES
          </div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px,5vw,48px)',
              margin: '8px 0 10px',
              lineHeight: 1.05,
            }}
          >
            Christian living for real life
          </h1>
          <p style={{ font: '15px/1.6 Arial,sans-serif', color: 'rgba(255,255,255,.8)', maxWidth: 720, margin: 0 }}>
            Marriage, work, anxiety, money, parenting, culture, rest — guidance rooted in Scripture for the niches of an
            ordinary week. Come for the topic you need; leave with a next step.
          </p>
          <div style={{ marginTop: 14, font: '800 12px Arial,sans-serif', color: '#ffd7a0' }}>
            {LIFE_NICHES.length} niches · {LIFE_BLOGS.length} guides
          </div>
        </div>
      </header>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(245,245,240,.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px clamp(12px,3vw,20px)', display: 'grid', gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search life guides (anxiety, marriage, work…)"
            aria-label="Search life desk"
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
            <button
              type="button"
              onClick={() => setNiche('all')}
              style={{
                border: niche === 'all' ? '1px solid #c00' : '1px solid #ccc',
                background: niche === 'all' ? '#c00' : '#fff',
                color: niche === 'all' ? '#fff' : '#222',
                padding: '8px 12px',
                font: '800 10px Arial,sans-serif',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              All niches
            </button>
            {LIFE_NICHES.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setNiche(n.key)}
                style={{
                  border: niche === n.key ? '1px solid #c00' : '1px solid #ccc',
                  background: niche === n.key ? '#c00' : '#fff',
                  color: niche === n.key ? '#fff' : '#222',
                  padding: '8px 12px',
                  font: '800 10px Arial,sans-serif',
                  letterSpacing: 0.6,
                  cursor: 'pointer',
                }}
              >
                {n.emoji} {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px clamp(12px,3vw,20px) 72px' }}>
        {niche === 'all' && !query.trim() && (
          <section style={{ marginBottom: 40 }} aria-label="Browse niches">
            <div style={{ borderBottom: '3px solid #1a1a1a', paddingBottom: 8, marginBottom: 18 }}>
              <div style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1.6, color: '#c00' }}>FIND YOUR TOPIC</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 28, margin: '6px 0 0' }}>Browse by niche</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                gap: 14,
              }}
            >
              {LIFE_NICHES.map((n) => {
                const count = LIFE_BLOGS.filter((p) => p.niche === n.key).length
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => setNiche(n.key)}
                    style={{
                      textAlign: 'left',
                      border: '1px solid #ddd',
                      background: '#fff',
                      padding: '16px 16px 18px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{n.emoji}</div>
                    <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 1, color: '#c00' }}>
                      {count} GUIDE{count === 1 ? '' : 'S'}
                    </div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, margin: '6px 0 8px', color: '#111' }}>
                      {n.label}
                    </h3>
                    <p style={{ font: '12px/1.5 Arial,sans-serif', color: '#666', margin: 0 }}>{n.blurb}</p>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <div style={{ borderBottom: '3px solid #1a1a1a', paddingBottom: 8, marginBottom: 18 }}>
            <div style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1.6, color: '#c00' }}>
              {active ? active.label.toUpperCase() : 'ALL GUIDES'}
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 28, margin: '6px 0 0' }}>
              {active ? active.emoji + ' ' + active.label : 'Latest from the Life Desk'}
            </h2>
            {active && (
              <p style={{ font: '14px/1.55 Arial,sans-serif', color: '#666', margin: '8px 0 0', maxWidth: 640 }}>
                {active.blurb}
              </p>
            )}
          </div>

          {posts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#777', font: '15px Arial,sans-serif' }}>
              No guides match. Try another niche or search.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                gap: 18,
              }}
            >
              {posts.map((p) => (
                <article
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenStory(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpenStory(p)
                    }
                  }}
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderTop: '4px solid #1a1a1a',
                    padding: '18px 18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 220,
                  }}
                >
                  <div style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1.2, color: '#c00' }}>
                    {p.emoji} {p.nicheLabel} · {p.tag}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Georgia,serif',
                      fontSize: 20,
                      lineHeight: 1.3,
                      margin: '10px 0 12px',
                      color: '#111',
                    }}
                  >
                    {p.headline}
                  </h3>
                  <p style={{ font: '13px/1.55 Arial,sans-serif', color: '#555', margin: 0, flex: 1 }}>
                    {p.summary}
                  </p>
                  <div style={{ marginTop: 14, font: '900 10px Arial,sans-serif', letterSpacing: 1, color: '#c00' }}>
                    READ GUIDE →
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
