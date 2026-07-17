/**
 * Story art resolution:
 *  - Imagine event plates: /story-art/story-{1-22}.jpg matched by SCRIPTURE ref
 *  - Per-story Imagine or SVG plates: /story-art/id-{storyId}.* from id index
 */

import idIndex from './storyArtIdIndex.json' with { type: 'json' }

export const STORY_ART_BY_ID = Object.fromEntries(
  Array.from({ length: 22 }, (_, i) => [i + 1, `/story-art/story-${i + 1}.jpg`]),
)

/** Direct file for a story row id, if generated (Imagine jpg or content SVG) */
export function getIdArtUrl(story) {
  if (!story || story.id == null) return null
  const u = idIndex[String(story.id)] || idIndex[story.id]
  return u || null
}

/**
 * Each event: which scripture chapters the art depicts.
 * chapters: inclusive list (or ranges expanded).
 * verseChapter: when set, only that chapter counts (for multi-chapter books like John).
 */
const ART_EVENTS = [
  { id: 1, book: 'genesis', chapters: [6, 7, 8], label: 'Flood / Noah' },
  { id: 2, book: 'genesis', chapters: [19], label: 'Sodom & Gomorrah' },
  { id: 3, book: 'genesis', chapters: [22], label: 'Abraham & Isaac' },
  { id: 4, book: 'genesis', chapters: [37], label: 'Joseph sold' },
  { id: 5, book: 'exodus', chapters: [7, 8, 9, 10, 11, 12], label: 'Plagues' },
  { id: 6, book: 'exodus', chapters: [14], label: 'Red Sea' },
  { id: 7, book: 'exodus', chapters: [19, 20], label: 'Sinai / Commandments' },
  { id: 8, book: 'exodus', chapters: [32], label: 'Golden calf' },
  { id: 9, book: '1 kings', chapters: [18], label: 'Elijah on Carmel' },
  { id: 10, book: 'john', chapters: [6], label: 'Feeding 5000' },
  { id: 11, book: 'john', chapters: [11], label: 'Lazarus' },
  { id: 12, book: 'acts', chapters: [2], label: 'Pentecost' },
  { id: 13, book: 'joshua', chapters: [3, 4], label: 'Jordan crossing' },
  { id: 14, book: 'joshua', chapters: [6], label: 'Jericho' },
  { id: 15, book: 'judges', chapters: [3], label: 'Ehud' },
  { id: 16, book: '1 samuel', chapters: [3], label: 'Samuel called' },
  { id: 17, book: '1 samuel', chapters: [17], label: 'David & Goliath' },
  { id: 18, book: '2 samuel', chapters: [12], label: 'Nathan confronts David' },
  { id: 19, book: '1 kings', chapters: [8], label: 'Temple dedication' },
  { id: 20, book: '1 kings', chapters: [19], label: 'Elijah at Horeb' },
  { id: 21, book: '2 kings', chapters: [2], label: 'Elijah taken up' },
  { id: 22, book: '2 kings', chapters: [19], label: 'Assyrian army struck' },
  // Parallel OT passages for the same event (same art)
  { id: 22, book: 'isaiah', chapters: [37], label: 'Assyrian army (Isaiah parallel)' },
  { id: 10, book: 'matthew', chapters: [14], label: 'Feeding 5000 (Matt)' },
  { id: 10, book: 'mark', chapters: [6], label: 'Feeding 5000 (Mark)' },
  { id: 10, book: 'luke', chapters: [9], label: 'Feeding 5000 (Luke)' },
]

/**
 * Gallery-guided plates that are NOT story-1…22.jpg.
 * Matched by scripture book+chapter so CMS id renumbering cannot break them.
 * Keep in sync with src/data/galleryImages.js titles/src.
 */
const GALLERY_SCRIPTURE_PLATES = [
  { src: '/story-art/id-23.jpg', book: 'genesis', chapters: [1], label: 'Let There Be Light' },
  { src: '/story-art/id-24.jpg', book: 'genesis', chapters: [2], label: 'Garden of Eden' },
  { src: '/story-art/id-26.jpg', book: 'genesis', chapters: [4], label: 'Two Brothers, Two Offerings' },
  { src: '/story-art/id-30.jpg', book: 'genesis', chapters: [11], label: 'Tower of Babel' },
  { src: '/story-art/id-31.jpg', book: 'genesis', chapters: [12], label: 'Call of Abram' },
]

function matchGalleryScripturePlate(story) {
  const book = storyBook(story)
  const chapters = storyChapters(story)
  if (!book || !chapters.length) return null
  let best = null
  let bestScore = 0
  for (const plate of GALLERY_SCRIPTURE_PLATES) {
    if (book !== plate.book) continue
    const overlap = chapters.filter((c) => plate.chapters.includes(c))
    if (!overlap.length) continue
    // Prefer exact single-chapter plates over broad ranges (e.g. Gen 1:1–2:3)
    const score = overlap.length * 10 + (chapters.length === 1 ? 5 : 0)
    if (score > bestScore) {
      bestScore = score
      best = plate.src
    }
  }
  return best
}

/** Normalize book names for comparison */
function normalizeBook(raw) {
  let b = String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
  // strip leading ordinal variants
  b = b
    .replace(/^i\s+/, '1 ')
    .replace(/^ii\s+/, '2 ')
    .replace(/^iii\s+/, '3 ')
    .replace(/^first\s+/, '1 ')
    .replace(/^second\s+/, '2 ')
    .replace(/^third\s+/, '3 ')
  // common aliases
  const aliases = {
    'gen': 'genesis',
    'ex': 'exodus',
    'exo': 'exodus',
    'lev': 'leviticus',
    'num': 'numbers',
    'deut': 'deuteronomy',
    'dt': 'deuteronomy',
    'josh': 'joshua',
    'judg': 'judges',
    'jdg': 'judges',
    '1 sam': '1 samuel',
    '2 sam': '2 samuel',
    '1 kgs': '1 kings',
    '2 kgs': '2 kings',
    '1 ki': '1 kings',
    '2 ki': '2 kings',
    'ps': 'psalms',
    'psa': 'psalms',
    'prov': 'proverbs',
    'isa': 'isaiah',
    'jer': 'jeremiah',
    'ezek': 'ezekiel',
    'dan': 'daniel',
    'hos': 'hosea',
    'matt': 'matthew',
    'mt': 'matthew',
    'mk': 'mark',
    'lk': 'luke',
    'jn': 'john',
    'rom': 'romans',
    'rev': 'revelation',
    'gospels': 'john', // never use alone — fallback only if no book
  }
  if (aliases[b]) return aliases[b]
  // "1samuel" → "1 samuel"
  b = b.replace(/^([123])([a-z])/, '$1 $2')
  return b
}

/**
 * Parse refs like:
 *  "Genesis 6–7", "Genesis 6:1–8:22", "1 Kings 18", "John 6:1–14",
 *  "2 Kings 19:1-37", "Joshua 3-4"
 * Returns { book, chapters: number[] }
 */
export function parseScriptureRef(ref) {
  if (!ref) return null
  let s = String(ref)
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  // Book = everything before first digit
  const m = s.match(/^((?:[123]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(.+)$/)
  if (!m) return null
  const book = normalizeBook(m[1])
  const rest = m[2].trim()

  const chapters = new Set()

  // Patterns: 6:1-8:22 (cross-chapter), 6:1-14, 6-8, 6, 3-4
  // Cross-chapter with verses: 6:1-8:22
  const cross = rest.match(/^(\d+)\s*:\s*\d+\s*-\s*(\d+)\s*:\s*\d+/)
  if (cross) {
    const a = +cross[1]
    const b = +cross[2]
    for (let c = Math.min(a, b); c <= Math.max(a, b); c++) chapters.add(c)
    return { book, chapters: [...chapters].sort((x, y) => x - y), raw: ref }
  }

  // Chapter range: 6-8 or 6–7
  const range = rest.match(/^(\d+)\s*-\s*(\d+)(?!\s*:)/)
  if (range) {
    const a = +range[1]
    const b = +range[2]
    for (let c = Math.min(a, b); c <= Math.max(a, b); c++) chapters.add(c)
    return { book, chapters: [...chapters].sort((x, y) => x - y), raw: ref }
  }

  // Single chapter with optional verses: 6:1-14 or 18 or 6:1
  const single = rest.match(/^(\d+)/)
  if (single) {
    chapters.add(+single[1])
    return { book, chapters: [...chapters], raw: ref }
  }

  return { book, chapters: [], raw: ref }
}

function storyBook(story) {
  // Prefer ref's book; fall back to story.book field
  const fromRef = parseScriptureRef(story?.ref)
  if (fromRef?.book) return fromRef.book
  return normalizeBook(story?.book)
}

function storyChapters(story) {
  const fromRef = parseScriptureRef(story?.ref)
  if (fromRef?.chapters?.length) return fromRef.chapters
  return []
}

/**
 * Score how well a story matches an art event via scripture.
 * High score only when book matches AND at least one chapter overlaps.
 */
function scriptureScore(story, event) {
  const book = storyBook(story)
  const chapters = storyChapters(story)
  if (!book || book !== event.book) return 0
  if (!chapters.length) return 0
  const overlap = chapters.filter((c) => event.chapters.includes(c))
  if (!overlap.length) return 0
  // Prefer tighter matches (single-chapter exact) over wide ranges
  const tightness = 10 - Math.min(9, event.chapters.length)
  return 100 + overlap.length * 10 + tightness
}

/**
 * Secondary: distinctive phrase match — whole words only, never short stems.
 * Used only when ref is missing/ambiguous.
 */
/** Distinctive multi-word phrases only (no single ambiguous names). bookHint optional. */
const PHRASE_HINTS = [
  { id: 1, book: 'genesis', phrases: ['global flood', 'into the ark', 'noah, described as blameless', 'family boards as rains'] },
  { id: 2, book: 'genesis', phrases: ['sodom and gomorrah', 'sulfur and fire', 'two cities destroyed overnight', 'lot and two daughters survived'] },
  { id: 3, book: 'genesis', phrases: ['mount moriah', 'do not lay your hand on the boy', 'ram was found in the thicket', 'raises knife over only son'] },
  { id: 4, book: 'genesis', phrases: ['sold into slavery by his own brothers', 'sold him to the ishmaelites', 'twenty pieces of silver', 'favorite son sold'] },
  { id: 5, book: 'exodus', phrases: ['ten plagues', 'ten catastrophic events', 'death of every firstborn', 'pass through the land of egypt that night'] },
  { id: 6, book: 'exodus', phrases: ['red sea', 'sea parts as hundreds', 'waters divided', 'egyptian chariot force'] },
  { id: 7, book: 'exodus', phrases: ['ten laws handed down', 'ten commandments', 'mountain engulfed in smoke'] },
  { id: 8, book: 'exodus', phrases: ['golden calf', 'cast them into a calf', 'these are your gods, o israel', 'melted down jewelry'] },
  { id: 9, book: '1 kings', phrases: ['mount carmel', '450 priests', 'priests of baal', 'water-drenched altar'] },
  { id: 10, book: null, phrases: ['five thousand fed', 'five loaves and two fish', 'five barley loaves', 'twelve baskets of leftovers'] },
  { id: 11, book: 'john', phrases: ['lazarus of bethany', 'dead four days', 'lazarus, come out', 'four days walks out of tomb'] },
  { id: 12, book: 'acts', phrases: ['wind fills jerusalem room', 'violent wind filling the house', 'languages they had never learned', 'three thousand joined that day'] },
  { id: 13, book: 'joshua', phrases: ['flooded jordan', 'priests carry the ark into the flooded', 'middle of the jordan'] },
  { id: 14, book: 'joshua', phrases: ['walls collapse after seven days', 'walls collapsed', 'fortified city of jericho', 'seven days of marching and one trumpet'] },
  { id: 15, book: 'judges', phrases: ['left-handed assassin', 'eglon king of moab', 'double-edged sword strapped', 'ehud, a left-handed'] },
  { id: 16, book: '1 samuel', phrases: ['samuel! samuel', 'called three times in the night', 'word of the lord was rare', 'it was not eli'] },
  { id: 17, book: '1 samuel', phrases: ['goliath of gath', 'valley of elah', 'five stones and a sling', 'shepherd boy with five stones'] },
  { id: 18, book: '2 samuel', phrases: ['you are the man', 'nathan said to david', 'story about a stolen lamb', 'poor man had nothing except one little ewe'] },
  { id: 19, book: '1 kings', phrases: ['glory of the lord filled his temple', 'priests could not perform their service because of the cloud', 'ark carried into the completed temple'] },
  { id: 20, book: '1 kings', phrases: ['gentle whisper', 'still small voice', 'after the fire came a gentle', 'not in the earthquake'] },
  { id: 21, book: '2 kings', phrases: ['chariot of fire', 'taken up in a whirlwind', 'elisha picks up his cloak', 'elijah goes up in a whirlwind'] },
  { id: 22, book: null, phrases: ['185,000', 'hundred and eighty-five thousand', 'assyrian soldiers found dead', 'sennacherib'] },
]

function phraseScore(story, hint) {
  // If we know the story's book and it conflicts with the hint book, skip
  const book = storyBook(story)
  if (hint.book && book && book !== hint.book && book !== 'gospels') return 0

  const blob = [
    story?.headline,
    story?.summary,
    ...(Array.isArray(story?.body) ? story.body.slice(0, 2) : []),
    story?.anchorVerse?.text,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  let score = 0
  for (const p of hint.phrases) {
    const needle = p.toLowerCase()
    if (needle.length < 8) continue // never match tiny fragments
    if (blob.includes(needle)) {
      score += 20 + needle.length
    }
  }
  return score
}

/**
 * Resolve which art id (1-22) belongs to this story, or null.
 * Priority:
 *  1. Scripture book+chapter overlap (authoritative)
 *  2. Distinctive multi-word phrases from headline/body/verse
 * Never: bare numeric story.id, never short stem keywords.
 */
export function matchStoryArtId(story) {
  if (!story) return null

  let bestId = null
  let best = 0

  for (const event of ART_EVENTS) {
    const sc = scriptureScore(story, event)
    if (sc > best) {
      best = sc
      bestId = event.id
    }
  }

  // Scripture book+chapter overlap is authoritative
  if (best >= 100) return bestId

  // If the story already has a clear book+chapter ref, do NOT guess via names/phrases.
  // (Prevents Gen 14 Lot/Sodom mentions, 2 Kings 18 siege, etc. stealing art from nearby chapters.)
  const parsed = parseScriptureRef(story?.ref)
  if (parsed?.book && parsed.chapters?.length) {
    return null
  }

  // Phrase fallback only when scripture ref is missing/unparseable
  let phraseBest = 0
  let phraseId = null
  for (const hint of PHRASE_HINTS) {
    const sc = phraseScore(story, hint)
    if (sc > phraseBest) {
      phraseBest = sc
      phraseId = hint.id
    }
  }

  if (phraseBest >= 30) return phraseId

  return null
}

export function getImagineArtUrl(story) {
  // 1) Scripture-matched event plate (story-1…22.jpg) — gallery event plates
  const eventId = matchStoryArtId(story)
  if (eventId && STORY_ART_BY_ID[eventId]) return STORY_ART_BY_ID[eventId]

  // 2) Gallery-guided id plates by scripture (creation, eden, babel, …)
  //    Independent of CMS/story row id so renumbering cannot mis-link images
  const galleryPlate = matchGalleryScripturePlate(story)
  if (galleryPlate) return galleryPlate

  // 3) Per-story raster upgrade from id index (id-N.jpg)
  const byId = getIdArtUrl(story)
  if (byId && /\.(jpe?g|png|webp)$/i.test(byId)) return byId

  // 4) Per-story SVG plate when no raster exists
  if (byId) return byId

  return null
}
