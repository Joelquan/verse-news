import React, { useState } from 'react'
import { resolveStoryImage, generatedStoryArt as generatedStoryArtFromLib } from '../../lib/storyImages.js'

/**
 * Refined homepage — default cold-visitor experience.
 * - One primary job: today's featured Scripture story
 * - Manual hero (no autoplay)
 * - Fewer shelves; calm hierarchy
 * - Keyboard-friendly story buttons
 * - Layout preference (Classic/New) lives in the site footer
 */
export default function RefinedHome({
  stories = [],
  homePack = {},
  dailyTopStories = [],
  dailyVerse,
  quoteNow,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
  searchResults = [],
  onStoryClick,
  onOpenGames,
  onOpenLife,
  onOpenBible,
  openBibleReference,
  toolsTicker = null,
  verseOfDayPanel = null,
  quotePanel = null,
}) {
  const featured = dailyTopStories.length ? dailyTopStories : (homePack.featured || [])
  const [heroIndex, setHeroIndex] = useState(0)
  const lead = featured[heroIndex] || featured[0] || stories[0]
  const topStories = featured.filter((s) => s && s.id !== lead?.id).slice(0, 4)
  const moreToday = featured.filter((s) => s && s.id !== lead?.id).slice(4, 7)
  const latest = (homePack.latest || []).slice(0, 5)

  const divisions = [
    { key: 'torah', label: 'Torah' },
    { key: 'history', label: 'History' },
    { key: 'wisdom', label: 'Wisdom' },
    { key: 'prophets', label: 'Prophets' },
    { key: 'gospels', label: 'Gospels' },
    { key: 'acts', label: 'Acts' },
    { key: 'epistles', label: 'Epistles' },
    { key: 'creation', label: 'Creation' },
  ]

  const goHero = (delta) => {
    if (featured.length < 2) return
    setHeroIndex((i) => (i + delta + featured.length) % featured.length)
  }

  const heroImg = lead
    ? (generatedStoryArtFromLib(lead, 1400, 788) || resolveStoryImage(lead, 1400, 788))
    : null

  return (
    <main className="vn-refined-home">
      {/* Tools — layout switch lives in footer so cold visitors see a paper, not a lab */}
      <section className="vn-premium-tools vn-refined-tools" aria-label="Site tools">
        <div className="vn-search-wrap">
          <input
            className="vn-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Scripture stories…"
            aria-label="Search Verse News"
          />
          <span className="vn-search-icon" aria-hidden>⌕</span>
          {searchResults.length > 0 && (
            <div className="vn-search-results vn-search-panel">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSearchQuery(''); onStoryClick(s) }}
                  className="vn-search-hit"
                >
                  <strong>{s.headline}</strong>
                  <span>{s.ref} · {s.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {toolsTicker}
        <button
          type="button"
          className="vn-tool-button"
          onClick={() => setDarkMode((v) => !v)}
          aria-pressed={darkMode}
        >
          {darkMode ? '☀ Light' : '☾ Dark'}
        </button>
      </section>

      {/* Masthead — one job + brand spine for cold visitors */}
      <header className="vn-refined-masthead">
        <p className="vn-refined-kicker">Today in Scripture</p>
        <h1 className="vn-refined-title">One story that shaped the world</h1>
        <p className="vn-refined-lede">
          Biblical events reported as news — plus Creation science &amp; Life guides.
        </p>
        <p className="vn-refined-sublede">
          Read the lead report, then go deeper in Scripture, commentary, or a short reflection.
        </p>
      </header>

      {/* Primary: hero + top list */}
      {lead && (
        <section className="vn-refined-primary" aria-label="Featured story">
          <article className="vn-refined-hero">
            <button
              type="button"
              className="vn-refined-hero-media"
              onClick={() => onStoryClick(lead)}
              aria-label={`Read story: ${lead.headline}`}
            >
              {heroImg ? (
                <img src={heroImg} alt="" loading="eager" />
              ) : (
                <div className="vn-refined-hero-fallback">{lead.emoji || '✝'}</div>
              )}
            </button>
            <div className="vn-refined-hero-body">
              <div className="vn-refined-meta">
                <span className="vn-refined-chip">{lead.tag || lead.contentType || 'REPORT'}</span>
                <span className="vn-refined-ref">{lead.ref}</span>
              </div>
              <h2 className="vn-refined-hero-headline">
                <button type="button" className="vn-refined-linkish" onClick={() => onStoryClick(lead)}>
                  {lead.headline}
                </button>
              </h2>
              <p className="vn-refined-summary">{lead.summary}</p>
              <div className="vn-refined-hero-actions">
                <button type="button" className="vn-refined-cta" onClick={() => onStoryClick(lead)}>
                  Read the report
                </button>
                {featured.length > 1 && (
                  <div className="vn-refined-hero-nav" aria-label="More featured stories">
                    <button type="button" onClick={() => goHero(-1)} aria-label="Previous featured story">‹</button>
                    <span>{heroIndex + 1} / {featured.length}</span>
                    <button type="button" onClick={() => goHero(1)} aria-label="Next featured story">›</button>
                  </div>
                )}
              </div>
            </div>
          </article>

          <aside className="vn-refined-rail" aria-label="Also today">
            <h3 className="vn-refined-rail-title">Also today</h3>
            <ul className="vn-refined-rail-list">
              {topStories.map((s, i) => (
                <li key={s.id}>
                  <button type="button" className="vn-refined-rail-item" onClick={() => onStoryClick(s)}>
                    <span className="vn-refined-rail-num">{i + 1}</span>
                    <span className="vn-refined-rail-copy">
                      <strong>{s.headline}</strong>
                      <em>{s.ref}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="vn-refined-quick">
              <button type="button" className="vn-refined-ghost" onClick={onOpenBible}>Open Bible</button>
              <button type="button" className="vn-refined-ghost" onClick={onOpenGames}>Play a game</button>
              <button type="button" className="vn-refined-ghost" onClick={() => onOpenLife?.()}>Life desk</button>
            </div>
          </aside>
        </section>
      )}

      {/* Secondary: three more stories only */}
      {moreToday.length > 0 && (
        <section className="vn-refined-more" aria-label="More for today">
          <div className="vn-refined-section-head">
            <h3>More for today</h3>
          </div>
          <div className="vn-refined-more-grid">
            {moreToday.map((s) => {
              const img = resolveStoryImage(s, 640, 360)
              return (
                <button
                  key={s.id}
                  type="button"
                  className="vn-refined-more-card"
                  onClick={() => onStoryClick(s)}
                >
                  <div className="vn-refined-more-art">
                    {img ? <img src={img} alt="" loading="lazy" /> : <span>{s.emoji}</span>}
                  </div>
                  <span className="vn-refined-more-kicker">{s.ref}</span>
                  <strong>{s.headline}</strong>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Latest — calm list, no fake “2 min ago” */}
      {latest.length > 0 && (
        <section className="vn-refined-latest" aria-label="From the desk">
          <div className="vn-refined-section-head">
            <h3>From the desk</h3>
            <p>Rotated daily through the full archive</p>
          </div>
          <ul className="vn-refined-latest-list">
            {latest.map((s) => (
              <li key={s.id}>
                <button type="button" className="vn-refined-latest-row" onClick={() => onStoryClick(s)}>
                  <span className="vn-refined-latest-ref">{s.ref}</span>
                  <strong>{s.headline}</strong>
                  <span className="vn-refined-latest-go">Read →</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* VOTD + Quote */}
      {(verseOfDayPanel || quotePanel) && (
        <section className="vn-refined-reflect vn-widget-grid" aria-label="Reflect">
          {verseOfDayPanel}
          {quotePanel}
        </section>
      )}

      {/* Browse sections — chips instead of full shelves */}
      <section className="vn-refined-browse" aria-label="Browse Scripture sections">
        <div className="vn-refined-section-head">
          <h3>Browse by section</h3>
          <p>Open a desk when you want depth — not all at once</p>
        </div>
        <div className="vn-refined-chips">
          {divisions.map((d) => (
            <button
              key={d.key}
              type="button"
              className="vn-refined-chip-btn"
              onClick={() => {
                // Parent uses filters via setFilters if provided through onStoryClick path —
                // use hash navigation via a custom event detail
                window.dispatchEvent(new CustomEvent('vn-navigate-division', { detail: d.key }))
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Single calm CTA strip instead of games carousel + life grid */}
      <section className="vn-refined-ctas" aria-label="Go further">
        <button type="button" className="vn-refined-cta-card" onClick={onOpenBible}>
          <span className="vn-refined-cta-kicker">Read</span>
          <strong>Bible reader</strong>
          <em>Scripture with historic commentary</em>
        </button>
        <button type="button" className="vn-refined-cta-card" onClick={onOpenGames}>
          <span className="vn-refined-cta-kicker">Practice</span>
          <strong>Verse Games</strong>
          <em>Twelve knowledge challenges</em>
        </button>
        <button type="button" className="vn-refined-cta-card" onClick={() => onOpenLife?.()}>
          <span className="vn-refined-cta-kicker">Live</span>
          <strong>Life Desk</strong>
          <em>Everyday Christian guides</em>
        </button>
      </section>
    </main>
  )
}
