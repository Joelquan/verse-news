import React, { useMemo, useState } from 'react'
import { GALLERY_CATEGORIES, GALLERY_IMAGES, filterGalleryImages } from '../data/galleryImages.js'

/**
 * Standalone image gallery — not linked to articles.
 * Add more images later via src/data/galleryImages.js
 */
export default function GalleryPage({ onClose }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [lightbox, setLightbox] = useState(null)

  const images = useMemo(
    () => filterGalleryImages({ category, query }),
    [category, query],
  )

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const img of images) {
      if (!map.has(img.category)) map.set(img.category, [])
      map.get(img.category).push(img)
    }
    const order = GALLERY_CATEGORIES.map((c) => c.key).filter((k) => k !== 'all')
    return order
      .filter((k) => map.has(k))
      .map((k) => ({
        key: k,
        label: GALLERY_CATEGORIES.find((c) => c.key === k)?.label || k,
        items: map.get(k),
      }))
  }, [images])

  return (
    <div className="gallery-page" style={{ background: '#f5f5f0', minHeight: '70vh' }}>
      <header
        style={{
          background: 'linear-gradient(120deg,#111 0 50%,#5a1212 50% 72%,#efe8d8 72%)',
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
          <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 2, color: '#ff8a8a', marginTop: 18 }}>
            VISUAL ARCHIVE
          </div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px,5vw,48px)',
              margin: '8px 0 10px',
              lineHeight: 1.05,
            }}
          >
            Image Gallery
          </h1>
          <p style={{ font: '15px/1.6 Arial,sans-serif', color: 'rgba(255,255,255,.8)', maxWidth: 640, margin: 0 }}>
            A growing collection of biblical scenes and illustrations. Browse freely — more images will be added over
            time.
          </p>
          <div style={{ marginTop: 14, font: '800 12px Arial,sans-serif', letterSpacing: 0.8, color: '#ffd7a0' }}>
            {images.length} image{images.length === 1 ? '' : 's'}
            {GALLERY_IMAGES.length !== images.length && ` · ${GALLERY_IMAGES.length} total in catalog`}
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
            placeholder="Search images by title or era…"
            aria-label="Search gallery"
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
            {GALLERY_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                style={{
                  border: category === c.key ? '1px solid #c00' : '1px solid #ccc',
                  background: category === c.key ? '#c00' : '#fff',
                  color: category === c.key ? '#fff' : '#222',
                  padding: '8px 12px',
                  font: '800 10px Arial,sans-serif',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
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
        {images.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#777', font: '15px Arial,sans-serif' }}>
            No images match your search.
          </div>
        ) : (
          byCategory.map((group) => (
            <section key={group.key} style={{ marginBottom: 42 }}>
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
                <div style={{ font: '900 11px Arial,sans-serif', letterSpacing: 1, color: '#888' }}>
                  {group.items.length}
                </div>
              </div>
              <div className="gallery-grid">
                {group.items.map((img) => (
                  <article
                    key={img.id}
                    className="gallery-card"
                    onClick={() => setLightbox(img)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setLightbox(img)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${img.title}`}
                  >
                    <div className="gallery-card-media">
                      <img src={img.src} alt={img.title} loading="lazy" />
                    </div>
                    <div className="gallery-card-body">
                      <div className="gallery-card-ref">{img.era || group.label}</div>
                      <h3>{img.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.88)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 'min(1100px,100%)', width: '100%' }}
          >
            <img
              src={lightbox.src}
              alt={lightbox.title}
              style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block', background: '#111' }}
            />
            <div style={{ color: '#fff', marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 20 }}>{lightbox.title}</div>
                <div style={{ font: '12px Arial,sans-serif', color: 'rgba(255,255,255,.65)', marginTop: 4 }}>
                  {[lightbox.era, lightbox.credit].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                style={{
                  border: '1px solid #888',
                  background: '#fff',
                  color: '#111',
                  padding: '10px 16px',
                  font: '900 11px Arial,sans-serif',
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
