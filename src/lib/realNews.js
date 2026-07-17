/**
 * Free real-world news fetchers → Verse News story shape.
 *
 * Sources (no paid plan required):
 *  1) Spaceflight News API — free, no key, CORS OK (science / cosmos)
 *  2) Public RSS via rss2json — free tier, no key for light use
 *  3) Optional NewsAPI.org if VITE_NEWS_API_KEY is set
 *
 * Items are normalized to the same shape as Scripture stories so they
 * mix into category desks and open in the standard article page.
 */

const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA' },
]

/** Map headlines into existing Verse desks for mixed placement */
export function categorizeRealNews(text) {
  const t = String(text || '').toLowerCase()
  if (/\b(space|nasa|mars|galaxy|planet|asteroid|climate|earthquake|volcano|species|dna|biology|physics|quantum|ocean|reef|weather|storm|hurricane|science|scientist|telescope|jwst|black hole)\b/.test(t)) {
    return { division: 'creation', book: 'wire-science', movement: 'Live Science Wire' }
  }
  if (/\b(church|christian|bible|pope|vatican|faith|worship|pastor|gospel|jesus|ministry|missionary)\b/.test(t)) {
    return { division: 'biography', book: 'wire-faith', movement: 'Faith & Culture Wire' }
  }
  if (/\b(war|conflict|military|army|missile|invasion|ceasefire|troops|battle|history|museum|archaeology)\b/.test(t)) {
    return { division: 'history', book: 'wire-world', movement: 'World Affairs Wire' }
  }
  if (/\b(election|parliament|congress|president|prime minister|diplomacy|sanctions|treaty|government)\b/.test(t)) {
    return { division: 'history', book: 'wire-politics', movement: 'Nations Wire' }
  }
  if (/\b(health|hospital|vaccine|disease|virus|medicine|doctor)\b/.test(t)) {
    return { division: 'creation', book: 'wire-health', movement: 'Life & Health Wire' }
  }
  return { division: 'livenews', book: 'wire', movement: 'World Wire' }
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function hashId(str) {
  let h = 2166136261
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `rn-${(h >>> 0).toString(36)}`
}

function paragraphsFromText(text, max = 4) {
  const clean = stripHtml(text)
  if (!clean) return ['Full coverage is available at the original source linked below.']
  // Prefer sentence splits for news blurbs
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  const chunks = []
  let buf = ''
  for (const s of sentences) {
    if ((buf + s).length > 320 && buf) {
      chunks.push(buf.trim())
      buf = s
    } else {
      buf += s
    }
    if (chunks.length >= max) break
  }
  if (buf.trim() && chunks.length < max) chunks.push(buf.trim())
  return chunks.length ? chunks : [clean.slice(0, 500)]
}

export function normalizeRealNewsItem(raw) {
  const headline = stripHtml(raw.title || raw.headline || 'Untitled report')
  const summary = stripHtml(raw.description || raw.summary || raw.abstract || '').slice(0, 320)
  const bodyText = stripHtml(raw.content || raw.body || raw.description || summary)
  const externalUrl = raw.url || raw.link || raw.news_site || ''
  const image = raw.image_url || raw.imageUrl || raw.image || raw.thumbnail || null
  const source = raw.source?.name || raw.news_site || raw.source || raw.author || 'Wire'
  const published = raw.publishedAt || raw.published_at || raw.pubDate || raw.updated_at || null
  const cat = categorizeRealNews(`${headline} ${summary}`)
  const id = hashId(externalUrl || headline)

  return {
    id,
    book: cat.book,
    division: cat.division,
    testament: 'live',
    contentType: 'LIVE',
    movement: cat.movement,
    movementRange: 'Real-time wire',
    emoji: cat.division === 'creation' ? '🛰️' : cat.division === 'biography' ? '🕊️' : '📰',
    tag: 'LIVE',
    location: source,
    dateline: published
      ? new Date(published).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : 'Live wire',
    headline,
    summary: summary || headline,
    ref: source,
    anchorVerse: null,
    body: paragraphsFromText(bodyText || summary || headline),
    scripture: [
      { verse: 'Source', text: `${source}${published ? ` · ${new Date(published).toISOString().slice(0, 10)}` : ''}` },
      { verse: 'Note', text: 'This is contemporary wire reporting mixed into Verse News. Verify details at the original publisher.' },
    ],
    commentary: [],
    image_url: typeof image === 'string' && image.startsWith('http') ? image : null,
    externalUrl: externalUrl && String(externalUrl).startsWith('http') ? externalUrl : null,
    isRealNews: true,
    sourceName: source,
    publishedAt: published,
  }
}

async function fetchJson(url, opts = {}, timeoutMs = 12000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

/** Free, no API key — space / science news */
async function fetchSpaceflightNews(limit = 12) {
  const data = await fetchJson(
    `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&ordering=-published_at`,
  )
  const results = data.results || data || []
  return results.map((a) =>
    normalizeRealNewsItem({
      title: a.title,
      description: a.summary,
      content: a.summary,
      url: a.url,
      image_url: a.image_url,
      news_site: a.news_site || 'Spaceflight News',
      published_at: a.published_at,
    }),
  )
}

/** Free RSS → JSON (public demo tier; best-effort) */
async function fetchRssFeed(feed, limit = 8) {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=${limit}`
  const data = await fetchJson(api)
  if (data.status !== 'ok' || !Array.isArray(data.items)) return []
  return data.items.map((item) =>
    normalizeRealNewsItem({
      title: item.title,
      description: item.description,
      content: item.content || item.description,
      url: item.link,
      image: item.thumbnail || item.enclosure?.link,
      source: feed.source,
      pubDate: item.pubDate,
    }),
  )
}

/** Optional NewsAPI.org (free developer key: https://newsapi.org) */
async function fetchNewsApi(limit = 20) {
  const key = import.meta.env.VITE_NEWS_API_KEY
  if (!key) return []
  // Free tier: top-headlines works from localhost; everything may be restricted
  const url =
    `https://newsapi.org/v2/top-headlines?language=en&pageSize=${limit}&apiKey=${encodeURIComponent(key)}`
  const data = await fetchJson(url)
  if (!Array.isArray(data.articles)) return []
  return data.articles
    .filter((a) => a && a.title && a.title !== '[Removed]')
    .map((a) =>
      normalizeRealNewsItem({
        title: a.title,
        description: a.description,
        content: a.content || a.description,
        url: a.url,
        image_url: a.urlToImage,
        source: a.source,
        publishedAt: a.publishedAt,
      }),
    )
}

function dedupe(items) {
  const seen = new Set()
  const out = []
  for (const it of items) {
    const key = (it.externalUrl || it.headline || it.id).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

/**
 * Fetch mixed free news. Always tries no-key sources; NewsAPI if configured.
 * @returns {Promise<{ items: object[], errors: string[], sources: string[] }>}
 */
export async function fetchRealNews() {
  const errors = []
  const sources = []
  const batches = []

  const tasks = [
    fetchSpaceflightNews(15)
      .then((items) => {
        sources.push('Spaceflight News API')
        batches.push(items)
      })
      .catch((e) => errors.push(`Spaceflight: ${e.message || e}`)),
    ...RSS_FEEDS.map((feed) =>
      fetchRssFeed(feed, 6)
        .then((items) => {
          if (items.length) {
            sources.push(feed.source)
            batches.push(items)
          }
        })
        .catch((e) => errors.push(`${feed.source}: ${e.message || e}`)),
    ),
    fetchNewsApi(15)
      .then((items) => {
        if (items.length) {
          sources.push('NewsAPI')
          batches.push(items)
        }
      })
      .catch((e) => errors.push(`NewsAPI: ${e.message || e}`)),
  ]

  await Promise.all(tasks)

  const items = dedupe(batches.flat()).sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })

  return { items, errors, sources }
}
