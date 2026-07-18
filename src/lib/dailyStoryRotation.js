/**
 * Daily homepage story circulation.
 *
 * - Stable order of the full catalog (same on every device)
 * - Each calendar day advances a window through that order
 * - After every story has been featured, the cycle restarts
 */

function hashSeed(str) {
  let h = 2166136261
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Local calendar day key + monotonic day index */
export function getDayInfo(now = new Date()) {
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const dayKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const midnight = new Date(y, now.getMonth(), d).getTime()
  const dayNumber = Math.floor(midnight / 86400000)
  return { dayKey, dayNumber }
}

/**
 * Deterministic shuffle of all stories (order never changes day-to-day).
 * Uses story id so remote + local catalogs stay consistent for the same set.
 */
export function getStableStoryOrder(stories) {
  const pool = (stories || []).filter((s) => s && s.headline && s.id != null)
  // Sort first so input order doesn't affect the shuffle
  pool.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))

  let seed = hashSeed('vn-home-cycle-v1')
  const random = () => {
    seed += 0x6d2b79f5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

/** Take `count` items starting at `start`, wrapping around the array */
export function takeWrapped(list, start, count) {
  const n = list.length
  if (!n || count <= 0) return []
  const out = []
  const take = Math.min(count, n)
  const base = ((start % n) + n) % n
  for (let i = 0; i < take; i++) {
    out.push(list[(base + i) % n])
  }
  return out
}

/**
 * Build today's homepage packs from the full catalog.
 *
 * @param {Array} stories
 * @param {Date} [now]
 * @param {{ featuredSize?: number }} [opts]
 */
/** Masthead stories: Bible reports first; Creation/Life are desks, not accidental leads. */
function isMastheadScriptureStory(s) {
  if (!s) return false
  if (s.division === 'creation' || s.division === 'life') return false
  if (s.contentType === 'SCIENCE' || s.testament === 'creation') return false
  if (s.isLifeBlog) return false
  return true
}

/**
 * Prefer Scripture reports at the front of the featured pack so cold visitors
 * meet the masthead promise first. Side desks still rotate into the list after.
 */
function prioritizeMastheadLead(featured) {
  if (!Array.isArray(featured) || featured.length < 2) return featured || []
  const lead = featured.filter(isMastheadScriptureStory)
  const rest = featured.filter((s) => !isMastheadScriptureStory(s))
  if (!lead.length) return featured
  return [...lead, ...rest]
}

export function getDailyHomePack(stories, now = new Date(), opts = {}) {
  const featuredSize = Math.max(1, opts.featuredSize || 7)
  // Home cycle focuses on masthead Scripture reports when available
  const scripturePool = getStableStoryOrder((stories || []).filter(isMastheadScriptureStory))
  const ordered = scripturePool.length >= featuredSize
    ? scripturePool
    : getStableStoryOrder(stories)
  const n = ordered.length
  const { dayKey, dayNumber } = getDayInfo(now)

  if (!n) {
    return {
      dayKey,
      dayNumber,
      ordered: [],
      cycleLength: 1,
      cycleDay: 0,
      featured: [],
      topStories: [],
      briefs: [],
      trending: [],
      latest: [],
      editors: [],
      popular: [],
      timeline: [],
      progressLabel: 'No stories yet',
    }
  }

  // Days needed so every story appears at least once in the featured window
  const cycleLength = Math.max(1, Math.ceil(n / featuredSize))
  const cycleDay = ((dayNumber % cycleLength) + cycleLength) % cycleLength
  const featuredStart = cycleDay * featuredSize

  const featured = prioritizeMastheadLead(
    takeWrapped(ordered, featuredStart, Math.min(featuredSize, n)),
  )

  // Secondary shelves use later windows so they also rotate daily
  // and mostly avoid duplicating the hero pack when the catalog is large
  const trending = takeWrapped(ordered, featuredStart + featuredSize, 6)
  const latest = takeWrapped(ordered, featuredStart + featuredSize + 6, 5)
  const editors = takeWrapped(ordered, featuredStart + featuredSize + 11, 5)
  const popularPool = ordered.filter((s) => s.anchorVerse)
  const popular = takeWrapped(
    popularPool.length ? popularPool : ordered,
    featuredStart + 3,
    5,
  )
  const timeline = takeWrapped(ordered, featuredStart + featuredSize + 16, 4)

  return {
    dayKey,
    dayNumber,
    ordered,
    cycleLength,
    cycleDay,
    featured,
    topStories: featured.slice(1, 5),
    briefs: featured.slice(4, 7),
    trending,
    latest,
    editors,
    popular,
    timeline,
    progressLabel: `Day ${cycleDay + 1} of ${cycleLength} in the home cycle · ${dayKey}`,
  }
}

/**
 * Daily slice for a single division shelf (Creation, Torah, …).
 * Rotates within that division so each section also changes daily.
 */
export function getDailyDivisionSlice(stories, divisionKey, dayNumber, count = 6) {
  const pool = getStableStoryOrder(
    (stories || []).filter((s) => s && s.division === divisionKey),
  )
  if (!pool.length) return []
  const size = Math.min(count, pool.length)
  const cycleLength = Math.max(1, Math.ceil(pool.length / size))
  const cycleDay = ((dayNumber % cycleLength) + cycleLength) % cycleLength
  return takeWrapped(pool, cycleDay * size, size)
}
