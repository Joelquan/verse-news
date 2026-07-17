import React, { useMemo, useState } from 'react'
import {
  CHRISTIAN_LIBRARY,
  LIBRARY_CATEGORIES,
  LIBRARY_ERAS,
  filterLibrary,
} from '../data/christianLibrary.js'

const VN_RED = '#cc0000'
const VN_MUTED = '#777'

/**
 * Open Christian library — Church Fathers to present free/open works.
 * Expand via src/data/christianLibrary.js
 */
export default function LibraryPage({ onClose }) {
  const [query, setQuery] = useState('')
  const [era, setEra] = useState('all')
  const [category, setCategory] = useState('all')

  const books = useMemo(
    () => filterLibrary({ era, category, query }),
    [era, category, query],
  )

  const byEra = useMemo(() => {
    const order = LIBRARY_ERAS.map((e) => e.key).filter((k) => k !== 'all')
    const map = new Map()
    for (const b of books) {
      if (!map.has(b.era)) map.set(b.era, [])
      map.get(b.era).push(b)
    }
    return order
      .filter((k) => map.has(k))
      .map((k) => ({
        key: k,
        label: LIBRARY_ERAS.find((e) => e.key === k)?.label || k,
        items: map.get(k),
      }))
  }, [books])

  return (
    <div className="library-page" style={{ background: '#f5f5f0', minHeight: '70vh' }}>
      <header
        style={{
          background: 'linear-gradient(115deg,#0f1a14 0 46%,#3d2a12 46% 70%,#f0ebe0 70%)',
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
              minHeight: 40,
            }}
          >
            ← BACK TO NEWS
          </button>
          <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 2, color: '#c9a86c', marginTop: 18 }}>
            FREE & OPEN WORKS
          </div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px,5vw,48px)',
              margin: '8px 0 10px',
              lineHeight: 1.05,
            }}
          >
            Christian Library
          </h1>
          <p style={{ font: '15px/1.6 Arial,sans-serif', color: 'rgba(255,255,255,.82)', maxWidth: 700, margin: 0 }}>
            Open and public-domain Christian books — from the Church Fathers to modern classics. Read free online;
            more titles will be added over time.
          </p>
          <div style={{ marginTop: 14, font: '800 12px Arial,sans-serif', letterSpacing: 0.8, color: '#e8d4a8' }}>
            {books.length} work{books.length === 1 ? '' : 's'}
            {CHRISTIAN_LIBRARY.length !== books.length && ` · ${CHRISTIAN_LIBRARY.length} in catalog`}
          </div>
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
            placeholder="Search by title, author, or topic…"
            aria-label="Search library"
            style={{
              width: '100%',
              height: 44,
              border: '1px solid #bbb',
              padding: '0 14px',
              font: '16px Arial,sans-serif',
              background: '#fff',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1, color: VN_MUTED }}>ERA</span>
            {LIBRARY_ERAS.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => setEra(e.key)}
                style={{
                  border: era === e.key ? `1px solid ${VN_RED}` : '1px solid #ccc',
                  background: era === e.key ? VN_RED : '#fff',
                  color: era === e.key ? '#fff' : '#222',
                  padding: '8px 12px',
                  font: '800 10px Arial,sans-serif',
                  letterSpacing: 0.6,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ font: '900 10px Arial,sans-serif', letterSpacing: 1, color: VN_MUTED }}>TOPIC</span>
            {LIBRARY_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                style={{
                  border: category === c.key ? '1px solid #111' : '1px solid #ccc',
                  background: category === c.key ? '#111' : '#fff',
                  color: category === c.key ? '#fff' : '#222',
                  padding: '8px 12px',
                  font: '800 10px Arial,sans-serif',
                  letterSpacing: 0.6,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px clamp(12px,3vw,20px) 72px' }}>
        {books.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: VN_MUTED, font: '15px Arial,sans-serif' }}>
            No books match your filters.
          </div>
        ) : (
          byEra.map((group) => (
            <section key={group.key} style={{ marginBottom: 44 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'end',
                  gap: 12,
                  borderBottom: '3px solid #1a1a1a',
                  paddingBottom: 8,
                  marginBottom: 16,
                }}
              >
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, margin: 0 }}>{group.label}</h2>
                <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 1, color: VN_MUTED }}>
                  {group.items.length}
                </div>
              </div>
              <div className="library-grid">
                {group.items.map((book) => (
                  <article key={book.id} className="library-card">
                    <div className="library-card-era">
                      {book.century}
                      {book.year ? ` · ${book.year}` : ''}
                    </div>
                    <h3>{book.title}</h3>
                    <div className="library-card-author">{book.author}</div>
                    <p>{book.description}</p>
                    <div className="library-card-foot">
                      <span className="library-license">{book.license || 'Free / open'}</span>
                      {book.link ? (
                        <a href={book.link} target="_blank" rel="noopener noreferrer">
                          READ FREE →
                        </a>
                      ) : (
                        <span style={{ color: VN_MUTED, font: '800 10px Arial,sans-serif' }}>Link coming soon</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        <p style={{ font: '12px/1.6 Arial,sans-serif', color: VN_MUTED, marginTop: 8, maxWidth: 720 }}>
          Works are selected for free public access (public domain or open licensing). Always verify rights for your
          region when redistributing. Suggest or add more titles in the library catalog.
        </p>
      </main>
    </div>
  )
}
