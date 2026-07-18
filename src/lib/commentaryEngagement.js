/**
 * Local engagement for commentary cards:
 * insightful / share / star counts + reader comments.
 * Persists in localStorage (per browser) until a backend is wired.
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

/** Stable seed counts so cards never start at zero before community activity */
function seedCounts(storyId, idx) {
  const h = hashSeed(`${storyId}:${idx}`)
  return {
    insightful: 4 + (h % 47),
    shares: 1 + (h % 19),
    stars: 2 + ((h >>> 8) % 31),
  }
}

function key(storyId, idx) {
  return `vn-eng-v1-${storyId}-${idx}`
}

export function loadCommentaryEngagement(storyId, idx) {
  const seeds = seedCounts(storyId, idx)
  const empty = {
    insightful: seeds.insightful,
    shares: seeds.shares,
    stars: seeds.stars,
    liked: false,
    starred: false,
    comments: [],
  }
  if (typeof localStorage === 'undefined') return empty
  try {
    const raw = localStorage.getItem(key(storyId, idx))
    if (!raw) return empty
    const data = JSON.parse(raw)
    return {
      insightful: Math.max(0, Number(data.insightful) || seeds.insightful),
      shares: Math.max(0, Number(data.shares) || seeds.shares),
      stars: Math.max(0, Number(data.stars) || seeds.stars),
      liked: !!data.liked,
      starred: !!data.starred,
      comments: Array.isArray(data.comments)
        ? data.comments
            .filter((c) => c && typeof c.text === 'string' && c.text.trim())
            .map((c) => ({
              id: c.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: String(c.name || 'Reader').slice(0, 40),
              text: String(c.text).slice(0, 800),
              at: c.at || new Date().toISOString(),
            }))
        : [],
    }
  } catch {
    return empty
  }
}

export function saveCommentaryEngagement(storyId, idx, state) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      key(storyId, idx),
      JSON.stringify({
        insightful: state.insightful,
        shares: state.shares,
        stars: state.stars,
        liked: state.liked,
        starred: state.starred,
        comments: (state.comments || []).slice(-50),
      }),
    )
  } catch {
    /* quota / private mode */
  }
}

export function formatEngagementCount(n) {
  const v = Math.max(0, Number(n) || 0)
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(v)
}
