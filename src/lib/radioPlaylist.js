/**
 * Continuous “Read” playlist: articles, Bible chapters, or both.
 * Programmed by day so the feed has a stable schedule.
 */

import { getAllBibleChapters } from './bibleCatalog.js'

const MS_DAY = 86400000
const BIBLE_API = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles'

export function isArticleEligible(story) {
  if (!story) return false
  const body = Array.isArray(story.body) ? story.body.join(' ') : String(story.body || '')
  if (body.trim().length < 80) return false
  const div = String(story.division || '').toLowerCase()
  if (div === 'life') return false
  return true
}

export function getStableArticleOrder(stories = []) {
  return [...stories]
    .filter(isArticleEligible)
    .sort((a, b) => {
      const oa = Number(a.sort_order ?? a.id ?? 0)
      const ob = Number(b.sort_order ?? b.id ?? 0)
      if (oa !== ob) return oa - ob
      return String(a.id).localeCompare(String(b.id))
    })
}

function dayInfo(now = new Date()) {
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dayNumber = Math.floor(dayStart.getTime() / MS_DAY)
  const dayKey = dayStart.toISOString().slice(0, 10)
  const minutes = now.getHours() * 60 + now.getMinutes()
  const slot = Math.floor(minutes / 8)
  return { dayNumber, dayKey, slot }
}

/**
 * @param {'bible'|'articles'|'both'} feed
 * @param {{ bibleBook?: string, bibleChapter?: number }} [opts]
 *        Optional fixed Bible start (book slug + chapter). Continues forward through the canon.
 */
export function buildReadQueue(stories = [], now = new Date(), feed = 'both', maxItems = 60, opts = {}) {
  const { dayNumber, dayKey, slot } = dayInfo(now)
  const items = []
  const bibleBook = opts.bibleBook ? String(opts.bibleBook).toLowerCase() : ''
  const bibleChapter = Number(opts.bibleChapter) || 0

  if (feed === 'bible' || feed === 'both') {
    const chapters = getAllBibleChapters()
    const n = chapters.length
    if (n) {
      let start = ((dayNumber * 3) + slot) % n
      if (bibleBook) {
        const found = chapters.findIndex(
          (ch) => ch.book === bibleBook && (!bibleChapter || ch.chapter === bibleChapter),
        )
        if (found >= 0) start = found
        else {
          const bookOnly = chapters.findIndex((ch) => ch.book === bibleBook)
          if (bookOnly >= 0) start = bookOnly
        }
      }
      const count = feed === 'bible' ? Math.min(maxItems, n) : Math.min(Math.ceil(maxItems / 2), n)
      for (let i = 0; i < count; i++) {
        const ch = chapters[(start + i) % n]
        items.push({
          kind: 'bible',
          id: `bible-${ch.book}-${ch.chapter}`,
          book: ch.book,
          bookName: ch.bookName,
          chapter: ch.chapter,
          headline: `${ch.bookName} ${ch.chapter}`,
          ref: `${ch.bookName} ${ch.chapter} · KJV`,
          emoji: '📖',
          // segments loaded on demand
          segments: null,
        })
      }
    }
  }

  if (feed === 'articles' || feed === 'both') {
    const ordered = getStableArticleOrder(stories)
    const n = ordered.length
    if (n) {
      const start = ((dayNumber * 17) + slot) % n
      const count = feed === 'articles' ? Math.min(maxItems, n) : Math.min(Math.floor(maxItems / 2), n)
      for (let i = 0; i < count; i++) {
        const story = ordered[(start + i) % n]
        items.push({
          kind: 'article',
          id: `article-${story.id}`,
          storyId: story.id,
          story,
          headline: story.headline,
          ref: story.ref,
          emoji: story.emoji || '📰',
          segments: storyToSpeechSegments(story),
        })
      }
    }
  }

  // Interleave for "both": bible, article, bible, article…
  if (feed === 'both' && items.length > 2) {
    const bible = items.filter((i) => i.kind === 'bible')
    const arts = items.filter((i) => i.kind === 'article')
    const mixed = []
    const len = Math.max(bible.length, arts.length)
    for (let i = 0; i < len; i++) {
      if (bible[i]) mixed.push(bible[i])
      if (arts[i]) mixed.push(arts[i])
    }
    return { dayKey, feed, items: mixed }
  }

  return { dayKey, feed, items }
}

/** @deprecated use buildReadQueue */
export function buildRadioQueue(stories, now = new Date(), maxArticles = 50) {
  return buildReadQueue(stories, now, 'articles', maxArticles)
}

export function storyToSpeechSegments(story, maxChars = 2200) {
  if (!story) return []
  const segments = []
  const headline = String(story.headline || '').trim()
  const summary = String(story.summary || '').trim()
  const ref = String(story.ref || '').trim()
  const location = String(story.location || '').trim()

  const openers = []
  if (headline) openers.push(headline)
  if (ref) openers.push(`Source: ${ref}.`)
  if (location) openers.push(`Filed from ${location}.`)
  if (summary) openers.push(summary)

  const intro = openers.join(' ')
  if (intro) {
    segments.push({ id: `${story.id}-intro`, label: 'Intro', text: intro })
  }

  const bodyParas = (Array.isArray(story.body) ? story.body : [story.body])
    .map((p) => (typeof p === 'string' ? p : p?.p || p?.text || ''))
    .map((p) => String(p || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  for (let i = 0; i < bodyParas.length; i++) {
    chunkText(bodyParas[i], maxChars).forEach((chunk, j) => {
      segments.push({
        id: `${story.id}-body-${i}-${j}`,
        label: `Report ${i + 1}`,
        text: chunk,
      })
    })
  }

  const scripture = Array.isArray(story.scripture) ? story.scripture : []
  if (scripture.length) {
    const lines = scripture.slice(0, 6).map((s) => {
      const v = s.verse || s.ref || ''
      const t = s.text || ''
      return v ? `${v}. ${t}` : t
    }).filter(Boolean)
    if (lines.length) {
      const block = `Key lines. ${lines.join(' ')}`
      chunkText(block, maxChars).forEach((chunk, j) => {
        segments.push({
          id: `${story.id}-scripture-${j}`,
          label: story.contentType === 'SCIENCE' ? 'Key Facts' : 'Scripture',
          text: chunk,
        })
      })
    }
  }

  segments.push({
    id: `${story.id}-out`,
    label: 'Bridge',
    text: 'This has been Verse News Read. Next selection coming up.',
  })

  return segments.filter((s) => s.text && s.text.length > 0)
}

/**
 * Fetch a Bible chapter (KJV by default) and split into speakable segments.
 */
export async function loadBibleChapterSegments(item, version = 'en-kjv', maxChars = 1800) {
  if (!item?.book || !item?.chapter) return []
  const url = `${BIBLE_API}/${version}/books/${item.book}/chapters/${item.chapter}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not load ${item.bookName} ${item.chapter}`)
  const data = await res.json()
  const verses = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  if (!verses.length) throw new Error(`Empty chapter: ${item.bookName} ${item.chapter}`)

  const segments = [{
    id: `bible-${item.book}-${item.chapter}-intro`,
    label: 'Chapter',
    text: `${item.bookName}, chapter ${item.chapter}. From the King James Version.`,
  }]

  // Group ~4 verses per spoken chunk for natural pacing
  const groupSize = 4
  for (let i = 0; i < verses.length; i += groupSize) {
    const slice = verses.slice(i, i + groupSize)
    const startV = slice[0]?.verse || i + 1
    const endV = slice[slice.length - 1]?.verse || startV
    const body = slice.map((v) => {
      const t = String(v.text || '').replace(/\s+/g, ' ').trim()
      return t
    }).filter(Boolean).join(' ')
    if (!body) continue
    const label = startV === endV ? `Verse ${startV}` : `Verses ${startV}–${endV}`
    chunkText(`${label}. ${body}`, maxChars).forEach((chunk, j) => {
      segments.push({
        id: `bible-${item.book}-${item.chapter}-${startV}-${j}`,
        label,
        text: chunk,
      })
    })
  }

  segments.push({
    id: `bible-${item.book}-${item.chapter}-out`,
    label: 'Bridge',
    text: `End of ${item.bookName} chapter ${item.chapter}.`,
  })

  return segments
}

/** Resolve item to segments (bible fetches; articles use cache) */
export async function resolveReadItemSegments(item) {
  if (!item) return []
  if (item.kind === 'article') {
    if (item.segments?.length) return item.segments
    return storyToSpeechSegments(item.story)
  }
  if (item.kind === 'bible') {
    if (item.segments?.length) return item.segments
    return loadBibleChapterSegments(item)
  }
  return []
}

function chunkText(text, maxChars) {
  const t = String(text || '').trim()
  if (!t) return []
  if (t.length <= maxChars) return [t]
  const out = []
  let rest = t
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf('. ', maxChars)
    if (cut < maxChars * 0.5) cut = rest.lastIndexOf(' ', maxChars)
    if (cut < 1) cut = maxChars
    out.push(rest.slice(0, cut + 1).trim())
    rest = rest.slice(cut + 1).trim()
  }
  if (rest) out.push(rest)
  return out
}
