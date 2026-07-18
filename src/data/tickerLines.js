/**
 * Short Bible lines + servant quotes for the tools-bar ticker.
 * Rotates every 5 minutes (see getTickerLine).
 */
import { SERVANT_QUOTES } from './servantQuotes.js'

/** Compact Scripture lines suitable for a one-line strip */
export const TICKER_VERSES = [
  { kind: 'verse', text: 'For God so loved the world, that he gave his only Son…', ref: 'John 3:16' },
  { kind: 'verse', text: 'The LORD is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
  { kind: 'verse', text: 'Trust in the LORD with all your heart.', ref: 'Proverbs 3:5' },
  { kind: 'verse', text: 'Fear not, for I am with you.', ref: 'Isaiah 41:10' },
  { kind: 'verse', text: 'I can do all things through Christ who strengthens me.', ref: 'Philippians 4:13' },
  { kind: 'verse', text: 'All things work together for good for those who love God.', ref: 'Romans 8:28' },
  { kind: 'verse', text: 'I know the plans I have for you, declares the LORD.', ref: 'Jeremiah 29:11' },
  { kind: 'verse', text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { kind: 'verse', text: 'Your word is a lamp to my feet and a light to my path.', ref: 'Psalm 119:105' },
  { kind: 'verse', text: 'The joy of the LORD is your strength.', ref: 'Nehemiah 8:10' },
  { kind: 'verse', text: 'Come to me, all who labor and are heavy laden.', ref: 'Matthew 11:28' },
  { kind: 'verse', text: 'I am the way, and the truth, and the life.', ref: 'John 14:6' },
  { kind: 'verse', text: 'Love is patient and kind.', ref: '1 Corinthians 13:4' },
  { kind: 'verse', text: 'Walk by faith, not by sight.', ref: '2 Corinthians 5:7' },
  { kind: 'verse', text: 'In the beginning, God created the heavens and the earth.', ref: 'Genesis 1:1' },
  { kind: 'verse', text: 'The LORD bless you and keep you.', ref: 'Numbers 6:24' },
  { kind: 'verse', text: 'As for me and my house, we will serve the LORD.', ref: 'Joshua 24:15' },
  { kind: 'verse', text: 'Create in me a clean heart, O God.', ref: 'Psalm 51:10' },
  { kind: 'verse', text: 'They who wait for the LORD shall renew their strength.', ref: 'Isaiah 40:31' },
  { kind: 'verse', text: 'Let justice roll down like waters.', ref: 'Amos 5:24' },
  { kind: 'verse', text: 'Blessed are the pure in heart, for they shall see God.', ref: 'Matthew 5:8' },
  { kind: 'verse', text: 'Seek first the kingdom of God and his righteousness.', ref: 'Matthew 6:33' },
  { kind: 'verse', text: 'You will know the truth, and the truth will set you free.', ref: 'John 8:32' },
  { kind: 'verse', text: 'Greater love has no one than this, that someone lay down his life for his friends.', ref: 'John 15:13' },
  { kind: 'verse', text: 'God is our refuge and strength, a very present help in trouble.', ref: 'Psalm 46:1' },
  { kind: 'verse', text: 'Cast all your anxieties on him, because he cares for you.', ref: '1 Peter 5:7' },
  { kind: 'verse', text: 'Jesus Christ is the same yesterday and today and forever.', ref: 'Hebrews 13:8' },
  { kind: 'verse', text: 'Rejoice in the Lord always; again I will say, rejoice.', ref: 'Philippians 4:4' },
  { kind: 'verse', text: 'The light shines in the darkness, and the darkness has not overcome it.', ref: 'John 1:5' },
  { kind: 'verse', text: 'Be strong and courageous. Do not be frightened.', ref: 'Joshua 1:9' },
]

const FIVE_MIN_MS = 5 * 60 * 1000

let _mixedCache = null

/** Interleave verses and servant quotes so the strip stays varied */
export function getMixedTickerLines() {
  if (_mixedCache) return _mixedCache
  const quotes = SERVANT_QUOTES.map((q) => ({
    kind: 'quote',
    text: q.text,
    ref: q.author,
    source: q.source || '',
  }))
  const mixed = []
  const a = TICKER_VERSES
  const b = quotes
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) {
    if (i < a.length) mixed.push(a[i])
    if (i < b.length) mixed.push(b[i])
  }
  _mixedCache = mixed
  return mixed
}

/**
 * Line fixed for the current 5-minute window (same for all visitors).
 * @returns {{ kind, text, ref, source?, slot, windowEnd, msLeft }}
 */
export function getTickerLine(now = new Date()) {
  const lines = getMixedTickerLines()
  const slot = Math.floor(now.getTime() / FIVE_MIN_MS)
  const line = lines[Math.abs(slot) % lines.length]
  const windowEnd = (slot + 1) * FIVE_MIN_MS
  const msLeft = Math.max(0, windowEnd - now.getTime())
  return {
    ...line,
    slot,
    windowEnd: new Date(windowEnd),
    msLeft,
  }
}

export function formatTickerCountdown(msLeft) {
  const m = Math.floor(msLeft / 60000)
  const s = Math.floor((msLeft % 60000) / 1000)
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}
