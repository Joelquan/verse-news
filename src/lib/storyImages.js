/**
 * Article illustrations (gallery is the visual source of truth):
 * 1) Local plates under /story-art/ (scripture-matched story-N.jpg + id-N.* from gallery/index)
 * 2) CMS image_url only when no local plate exists
 * 3) Inline SVG scene fallback
 */

import { getImagineArtUrl } from './storyArtMap.js'

const cache = new Map()

function storyBlob(story) {
  return [
    story?.headline,
    story?.summary,
    story?.book,
    story?.division,
    story?.location,
    story?.movement,
    story?.dateline,
    story?.ref,
    story?.tag,
    story?.contentType,
    story?.anchorVerse?.text,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Scene catalog: keyword score → illustration type */
const SCENES = [
  { id: 'creation', keys: ['creat', 'six day', 'formless', 'begin', 'heaven and earth', 'genesis 1', 'light', 'cosmos', 'universe', 'galaxy', 'cosmic', 'microwave', 'astronomy', 'planet', 'exoplanet', 'photosynthesis', 'dna', 'gravity', 'spectrum', 'thermodynamic', 'photon', 'tectonic', 'coral', 'microbiome', 'migration'] },
  { id: 'eden', keys: ['eden', 'garden', 'tree of', 'serpent', 'fruit', 'paradise'] },
  { id: 'flood', keys: ['flood', 'ark', 'noah', 'rain', 'deluge', 'waters covered'] },
  { id: 'fire_city', keys: ['sodom', 'gomorrah', 'brimstone', 'overthrown', 'destroyed overnight'] },
  { id: 'sacrifice', keys: ['knife', 'isaac', 'abraham', 'moriah', 'ram', 'offering', 'sacrifice'] },
  { id: 'slavery', keys: ['sold', 'slavery', 'slave', 'joseph', 'brothers', 'egypt potiphar'] },
  { id: 'plagues', keys: ['plague', 'pharaoh', 'egypt', 'blood', 'frogs', 'locust', 'firstborn'] },
  { id: 'red_sea', keys: ['sea part', 'red sea', 'dry ground', 'egyptian army', 'crossing', 'yam'] },
  { id: 'sinai', keys: ['commandment', 'ten law', 'sinai', 'tablet', 'smoke', 'thunder', 'horeb', 'mountain engulfed'] },
  { id: 'idol', keys: ['golden calf', 'idol', 'molten', 'jewelry', 'calf'] },
  { id: 'fire_altar', keys: ['carmel', 'elijah', 'fire test', 'priests', 'altar', 'baal'] },
  { id: 'jordan', keys: ['jordan', 'ark into', 'river stops', 'priests carry'] },
  { id: 'walls', keys: ['walls collapse', 'jericho', 'trumpet', 'marching', 'seven days'] },
  { id: 'battle', keys: ['battle', 'war', 'sword', 'army', 'assassin', 'kill', 'goliath', 'sling', 'philistine'] },
  { id: 'king', keys: ['anoint', 'king', 'crown', 'throne', 'david', 'solomon', 'reign'] },
  { id: 'shepherd', keys: ['sheep', 'shepherd', 'flock', 'pasture', 'psalm 23', 'lamb'] },
  { id: 'prophet', keys: ['prophet', 'vision', 'oracle', 'isaiah', 'jeremiah', 'woe'] },
  { id: 'temple', keys: ['temple', 'zion', 'holy city', 'rebuild', 'nehemiah', 'second temple', 'solomon\'s temple'] },
  { id: 'loaves', keys: ['loaves', 'fishes', 'five thousand', 'fed', 'bread', 'multiply'] },
  { id: 'boat', keys: ['boat', 'fishermen', 'galilee', 'net', 'storm', 'walk on water', 'sea of'] },
  { id: 'tomb', keys: ['tomb', 'raised', 'resurrection', 'risen', 'empty', 'lazarus', 'stone rolled', 'dead four'] },
  { id: 'cross', keys: ['cross', 'crucif', 'golgotha', 'calvary', 'nail'] },
  { id: 'nativity', keys: ['manger', 'bethlehem', 'born', 'nativity', 'magi', 'infant'] },
  { id: 'pentecost', keys: ['pentecost', 'tongues', 'wind fills', 'holy spirit', 'upper room', 'three thousand', 'foreign languages', 'rushing wind', 'speaks foreign'] },
  { id: 'road', keys: ['paul', 'damascus', 'saul', 'mission', 'road', 'journey', 'gentile'] },
  { id: 'prison', keys: ['prison', 'jail', 'chain', 'captive', 'jailer'] },
  { id: 'ascension', keys: ['ascension', 'taken up', 'cloud', 'looking at the sky'] },
  { id: 'desert', keys: ['desert', 'wilderness', 'sand', 'manna', 'wander'] },
  { id: 'wisdom', keys: ['wisdom', 'proverb', 'ecclesiastes', 'job', 'scroll', 'letter', 'epistle'] },
  { id: 'healing', keys: ['heal', 'blind', 'leper', 'paralytic', 'miracle', 'lame'] },
  { id: 'coins', keys: ['silver', 'betray', 'judas', 'money', 'coin', 'tax'] },
]

const BOOK_SCENE = {
  genesis: 'creation',
  exodus: 'desert',
  leviticus: 'fire_altar',
  numbers: 'desert',
  deuteronomy: 'sinai',
  joshua: 'walls',
  judges: 'battle',
  ruth: 'shepherd',
  samuel: 'shepherd',
  '1 samuel': 'shepherd',
  '2 samuel': 'king',
  kings: 'king',
  '1 kings': 'fire_altar',
  '2 kings': 'battle',
  chronicles: 'temple',
  ezra: 'temple',
  nehemiah: 'walls',
  esther: 'king',
  job: 'wisdom',
  psalms: 'shepherd',
  proverbs: 'wisdom',
  ecclesiastes: 'wisdom',
  isaiah: 'prophet',
  jeremiah: 'prophet',
  ezekiel: 'prophet',
  daniel: 'king',
  hosea: 'prophet',
  jonah: 'boat',
  matthew: 'loaves',
  mark: 'boat',
  luke: 'nativity',
  john: 'tomb',
  acts: 'pentecost',
  romans: 'road',
  corinthians: 'wisdom',
  galatians: 'road',
  ephesians: 'wisdom',
  philippians: 'prison',
  hebrews: 'temple',
  revelation: 'creation',
}

const DIVISION_SCENE = {
  creation: 'creation',
  torah: 'desert',
  history: 'battle',
  wisdom: 'wisdom',
  prophets: 'prophet',
  gospels: 'boat',
  acts: 'pentecost',
  epistles: 'wisdom',
  revivals: 'fire_altar',
  martyrs: 'cross',
  biography: 'road',
}

// Science desks → illustration scenes
const SCIENCE_BOOK_SCENE = {
  astronomy: 'creation',
  earth: 'desert',
  biology: 'shepherd',
  physics: 'creation',
}

function pickScene(story) {
  const blob = storyBlob(story)
  let best = null
  let bestScore = 0
  for (const scene of SCENES) {
    let score = 0
    for (const k of scene.keys) {
      if (blob.includes(k)) score += Math.min(4, Math.ceil(k.length / 4))
    }
    if (score > bestScore) {
      bestScore = score
      best = scene.id
    }
  }
  if (best && bestScore > 0) return best

  const book = String(story?.book || '')
    .toLowerCase()
    .replace(/^\d+\s*/, '')
  if (SCIENCE_BOOK_SCENE[book]) return SCIENCE_BOOK_SCENE[book]
  if (BOOK_SCENE[book]) return BOOK_SCENE[book]
  for (const [k, id] of Object.entries(BOOK_SCENE)) {
    if (book.includes(k) || k.includes(book)) return id
  }
  const div = String(story?.division || '').toLowerCase()
  if (DIVISION_SCENE[div]) return DIVISION_SCENE[div]
  return 'creation'
}

function palette(story) {
  const seed = Number(story?.id) || hashStr(String(story?.headline || 'vn'))
  const hues = {
    creation: [215, 200],
    eden: [140, 95],
    flood: [205, 220],
    fire_city: [15, 35],
    sacrifice: [30, 45],
    slavery: [25, 210],
    plagues: [350, 40],
    red_sea: [195, 210],
    sinai: [25, 15],
    idol: [45, 35],
    fire_altar: [12, 30],
    jordan: [190, 160],
    walls: [30, 25],
    battle: [0, 20],
    king: [42, 35],
    shepherd: [100, 85],
    prophet: [260, 30],
    temple: [35, 40],
    loaves: [35, 15],
    boat: [200, 190],
    tomb: [220, 30],
    cross: [0, 20],
    nativity: [45, 210],
    pentecost: [15, 45],
    road: [30, 200],
    prison: [220, 0],
    ascension: [210, 45],
    desert: [35, 25],
    wisdom: [40, 25],
    healing: [160, 190],
    coins: [42, 30],
  }
  const scene = pickScene(story)
  const [h1, h2] = hues[scene] || [20, 0]
  const shift = (seed * 7) % 12
  return {
    scene,
    seed,
    from: `hsl(${h1 + shift}, 42%, 22%)`,
    to: `hsl(${h2 + shift}, 38%, 12%)`,
    mid: `hsl(${h1}, 35%, 32%)`,
    accent: `hsl(${(h1 + 8) % 360}, 72%, 52%)`,
    light: `hsl(${h1}, 40%, 88%)`,
    paper: '#f4efe4',
    ink: '#1a1410',
  }
}

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function esc(t) {
  return String(t || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrap(text, max = 28, lines = 2) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const out = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > max && cur) {
      out.push(cur)
      cur = w
      if (out.length >= lines) break
    } else cur = next
  }
  if (out.length < lines && cur) out.push(cur)
  if (words.join(' ').length > out.join(' ').length) {
    const last = out[out.length - 1] || ''
    out[out.length - 1] = last.replace(/.{0,1}$/, '…')
  }
  return out.slice(0, lines)
}

/** Draw scene-specific illustration layers (viewBox 0 0 100 56 for 16:9-ish) */
function sceneArt(scene, p) {
  const a = p.accent
  const L = p.light
  switch (scene) {
    case 'flood':
      return `
        <ellipse cx="50" cy="48" rx="55" ry="16" fill="${a}" opacity=".35"/>
        <path d="M0 42 Q15 36 30 42 T60 40 T100 44 V56 H0Z" fill="${a}" opacity=".55"/>
        <path d="M0 46 Q20 40 40 46 T80 44 T100 48 V56 H0Z" fill="${L}" opacity=".2"/>
        <path d="M38 34 h24 l4 6 h-32z" fill="${L}" opacity=".9"/>
        <rect x="42" y="28" width="16" height="8" rx="1" fill="${L}"/>
        <path d="M50 22 l3 6 h-6z" fill="${a}"/>
        <circle cx="78" cy="14" r="5" fill="${L}" opacity=".35"/>
        <path d="M10 18 q8 4 4 10" stroke="${L}" stroke-width=".6" fill="none" opacity=".5"/>
        <path d="M20 12 q6 5 2 9" stroke="${L}" stroke-width=".5" fill="none" opacity=".4"/>
      `
    case 'red_sea':
      return `
        <path d="M0 20 Q20 50 0 56Z" fill="${a}" opacity=".7"/>
        <path d="M100 18 Q80 50 100 56Z" fill="${a}" opacity=".7"/>
        <path d="M28 56 V30 Q50 22 72 30 V56Z" fill="${L}" opacity=".25"/>
        <path d="M40 40 h20 l-2 4 h-16z" fill="${L}" opacity=".85"/>
        <circle cx="50" cy="12" r="7" fill="${L}" opacity=".45"/>
      `
    case 'desert':
    case 'plagues':
      return `
        <circle cx="78" cy="14" r="9" fill="${a}" opacity=".85"/>
        <path d="M0 40 Q25 28 50 40 T100 38 V56 H0Z" fill="${a}" opacity=".4"/>
        <path d="M0 46 Q30 36 60 46 T100 44 V56 H0Z" fill="${L}" opacity=".15"/>
        <path d="M18 38 l4 -10 4 10" stroke="${L}" stroke-width="1" fill="none" opacity=".5"/>
        <path d="M70 36 l3 -8 3 8" stroke="${L}" stroke-width=".8" fill="none" opacity=".4"/>
      `
    case 'sinai':
      return `
        <path d="M8 50 L32 14 L48 50Z" fill="${L}" opacity=".2"/>
        <path d="M30 50 L55 8 L78 50Z" fill="${L}" opacity=".35"/>
        <path d="M55 50 L75 22 L95 50Z" fill="${L}" opacity=".18"/>
        <path d="M52 8 l3 -6 2 6" stroke="${a}" stroke-width="1.4" fill="none"/>
        <path d="M48 10 l-4 -5" stroke="${a}" stroke-width="1" fill="none" opacity=".7"/>
        <path d="M60 10 l5 -4" stroke="${a}" stroke-width="1" fill="none" opacity=".7"/>
        <circle cx="55" cy="6" r="3" fill="${a}" opacity=".8"/>
      `
    case 'fire_altar':
    case 'fire_city':
      return `
        <rect x="30" y="38" width="40" height="10" fill="${L}" opacity=".25"/>
        <rect x="36" y="32" width="28" height="8" fill="${L}" opacity=".35"/>
        <path d="M50 32 Q46 20 50 12 Q54 20 50 32" fill="${a}"/>
        <path d="M44 30 Q40 18 45 14 Q48 22 44 30" fill="${a}" opacity=".7"/>
        <path d="M56 30 Q60 16 55 12 Q52 22 56 30" fill="${a}" opacity=".7"/>
        <circle cx="20" cy="16" r="2" fill="${L}" opacity=".4"/>
        <circle cx="80" cy="12" r="1.5" fill="${L}" opacity=".35"/>
      `
    case 'eden':
      return `
        <ellipse cx="50" cy="48" rx="40" ry="10" fill="${a}" opacity=".25"/>
        <path d="M50 42 V18" stroke="${L}" stroke-width="2"/>
        <circle cx="50" cy="16" r="12" fill="${a}" opacity=".55"/>
        <circle cx="40" cy="20" r="8" fill="${a}" opacity=".4"/>
        <circle cx="60" cy="20" r="8" fill="${a}" opacity=".4"/>
        <circle cx="58" cy="28" r="2.5" fill="${a}"/>
        <path d="M70 36 q8 2 6 10" stroke="${L}" stroke-width="1" fill="none" opacity=".5"/>
      `
    case 'creation':
    case 'ascension':
      return `
        <circle cx="50" cy="22" r="10" fill="${L}" opacity=".5"/>
        <circle cx="50" cy="22" r="16" fill="none" stroke="${L}" stroke-width=".6" opacity=".35"/>
        <circle cx="50" cy="22" r="22" fill="none" stroke="${L}" stroke-width=".4" opacity=".25"/>
        <path d="M0 40 Q50 28 100 40 V56 H0Z" fill="${a}" opacity=".3"/>
        <circle cx="18" cy="14" r="1.2" fill="${L}" opacity=".7"/>
        <circle cx="82" cy="10" r="1" fill="${L}" opacity=".6"/>
        <circle cx="70" cy="18" r=".8" fill="${L}" opacity=".5"/>
      `
    case 'sacrifice':
      return `
        <path d="M20 50 L50 18 L80 50Z" fill="${L}" opacity=".2"/>
        <rect x="42" y="34" width="16" height="12" fill="${L}" opacity=".35"/>
        <path d="M55 20 l12 4" stroke="${a}" stroke-width="1.5"/>
        <circle cx="68" cy="22" r="3" fill="${a}" opacity=".6"/>
        <path d="M30 48 h40" stroke="${L}" stroke-width="1" opacity=".4"/>
      `
    case 'slavery':
    case 'prison':
      return `
        <rect x="28" y="12" width="44" height="36" fill="${L}" opacity=".08" stroke="${L}" stroke-width=".8"/>
        ${[34, 42, 50, 58, 66].map((x) => `<line x1="${x}" y1="12" x2="${x}" y2="48" stroke="${L}" stroke-width="1.2" opacity=".55"/>`).join('')}
        <rect x="28" y="12" width="44" height="4" fill="${a}" opacity=".5"/>
      `
    case 'walls':
    case 'temple':
      return `
        <rect x="18" y="28" width="64" height="22" fill="${L}" opacity=".2"/>
        <rect x="22" y="18" width="10" height="32" fill="${L}" opacity=".35"/>
        <rect x="45" y="14" width="10" height="36" fill="${L}" opacity=".4"/>
        <rect x="68" y="18" width="10" height="32" fill="${L}" opacity=".35"/>
        <path d="M22 18 h10 v-4 h-10z M45 14 h10 v-4 h-10z M68 18 h10 v-4 h-10z" fill="${a}" opacity=".6"/>
        <rect x="38" y="34" width="24" height="16" fill="${p.to}" opacity=".5"/>
      `
    case 'battle':
      return `
        <path d="M20 48 L35 20 L40 48Z" fill="${L}" opacity=".25"/>
        <path d="M55 48 L70 16 L78 48Z" fill="${L}" opacity=".2"/>
        <path d="M48 14 l2 22" stroke="${a}" stroke-width="1.5"/>
        <path d="M42 18 h14" stroke="${a}" stroke-width="1.2"/>
        <circle cx="49" cy="12" r="2.5" fill="${a}"/>
        <path d="M10 50 h80" stroke="${L}" stroke-width=".5" opacity=".4"/>
      `
    case 'king':
      return `
        <path d="M35 28 h30 l4 8 h-38z" fill="${a}" opacity=".85"/>
        <path d="M38 28 v-8 l7 5 5-7 5 7 7-5 v8" fill="${a}"/>
        <circle cx="50" cy="18" r="2" fill="${L}"/>
        <rect x="40" y="36" width="20" height="14" fill="${L}" opacity=".25"/>
      `
    case 'shepherd':
      return `
        <ellipse cx="50" cy="46" rx="36" ry="8" fill="${a}" opacity=".2"/>
        <ellipse cx="40" cy="38" rx="10" ry="7" fill="${L}" opacity=".55"/>
        <circle cx="34" cy="32" r="5" fill="${L}" opacity=".55"/>
        <ellipse cx="62" cy="40" rx="8" ry="6" fill="${L}" opacity=".4"/>
        <circle cx="58" cy="35" r="4" fill="${L}" opacity=".4"/>
        <path d="M72 22 v20" stroke="${a}" stroke-width="1.5"/>
        <path d="M72 22 q8 2 6 10" stroke="${a}" stroke-width="1.2" fill="none"/>
      `
    case 'prophet':
    case 'wisdom':
      return `
        <rect x="32" y="14" width="36" height="28" rx="2" fill="${L}" opacity=".2"/>
        <path d="M38 20 h24 M38 26 h20 M38 32 h22" stroke="${L}" stroke-width="1" opacity=".55"/>
        <path d="M50 42 v6 M44 48 h12" stroke="${a}" stroke-width="1.2"/>
        <circle cx="72" cy="16" r="6" fill="${a}" opacity=".35"/>
      `
    case 'loaves':
      return `
        <ellipse cx="38" cy="36" rx="12" ry="7" fill="${a}" opacity=".7"/>
        <ellipse cx="55" cy="38" rx="11" ry="6" fill="${a}" opacity=".55"/>
        <ellipse cx="46" cy="44" rx="10" ry="5" fill="${a}" opacity=".45"/>
        <path d="M68 28 q12 4 8 14 q-10 2 -14 -4 q2 -10 6 -10z" fill="${L}" opacity=".55"/>
        <path d="M78 32 q8 3 5 10 q-7 1 -10 -3 q1 -7 5 -7z" fill="${L}" opacity=".4"/>
      `
    case 'boat':
      return `
        <path d="M0 38 Q50 28 100 38 V56 H0Z" fill="${a}" opacity=".4"/>
        <path d="M28 36 h44 l-6 10 h-32z" fill="${L}" opacity=".85"/>
        <path d="M50 36 V16" stroke="${L}" stroke-width="1.2"/>
        <path d="M50 16 l16 12 h-16z" fill="${a}" opacity=".7"/>
        <circle cx="80" cy="12" r="5" fill="${L}" opacity=".35"/>
      `
    case 'tomb':
      return `
        <ellipse cx="50" cy="48" rx="38" ry="8" fill="${a}" opacity=".2"/>
        <path d="M22 48 V28 Q50 8 78 28 V48" fill="${L}" opacity=".2"/>
        <circle cx="50" cy="34" r="11" fill="${p.to}"/>
        <circle cx="50" cy="34" r="11" fill="none" stroke="${L}" stroke-width="1" opacity=".4"/>
        <circle cx="68" cy="40" r="7" fill="${L}" opacity=".35"/>
      `
    case 'cross':
      return `
        <path d="M0 48 Q50 36 100 48 V56 H0Z" fill="${a}" opacity=".25"/>
        <path d="M50 12 V44" stroke="${L}" stroke-width="2.4"/>
        <path d="M38 22 H62" stroke="${L}" stroke-width="2.4"/>
        <circle cx="50" cy="12" r="2" fill="${a}"/>
      `
    case 'nativity':
      return `
        <path d="M25 40 L50 18 L75 40Z" fill="${L}" opacity=".25"/>
        <rect x="32" y="40" width="36" height="12" fill="${L}" opacity=".15"/>
        <circle cx="72" cy="14" r="3" fill="${a}"/>
        <path d="M72 18 v6 M69 20 h6" stroke="${a}" stroke-width=".8"/>
        <ellipse cx="50" cy="44" rx="8" ry="4" fill="${a}" opacity=".5"/>
      `
    case 'pentecost':
      return `
        <rect x="30" y="20" width="40" height="28" fill="${L}" opacity=".12"/>
        <path d="M40 20 V48 M50 20 V48 M60 20 V48" stroke="${L}" stroke-width="1" opacity=".35"/>
        <path d="M36 16 q4 -10 8 0" fill="${a}"/>
        <path d="M46 14 q4 -10 8 0" fill="${a}"/>
        <path d="M56 16 q4 -10 8 0" fill="${a}"/>
        <path d="M20 30 q20 -8 30 0 q20 8 40 -2" stroke="${L}" stroke-width=".8" fill="none" opacity=".4"/>
      `
    case 'road':
      return `
        <path d="M30 56 L46 20 H54 L70 56Z" fill="${L}" opacity=".2"/>
        <path d="M48 56 V28" stroke="${L}" stroke-width="1" stroke-dasharray="2 2" opacity=".5"/>
        <circle cx="72" cy="16" r="7" fill="${a}" opacity=".45"/>
        <path d="M18 40 q10 -6 8 4" stroke="${L}" stroke-width="1" fill="none" opacity=".4"/>
      `
    case 'healing':
      return `
        <circle cx="50" cy="28" r="14" fill="${L}" opacity=".15"/>
        <path d="M50 16 V40 M38 28 H62" stroke="${a}" stroke-width="2.5"/>
        <ellipse cx="50" cy="48" rx="24" ry="5" fill="${a}" opacity=".2"/>
      `
    case 'coins':
      return `
        <circle cx="40" cy="30" r="10" fill="${a}" opacity=".75"/>
        <circle cx="55" cy="34" r="10" fill="${a}" opacity=".6"/>
        <circle cx="48" cy="40" r="9" fill="${a}" opacity=".5"/>
        <text x="40" y="33" text-anchor="middle" fill="${L}" font-size="8" font-family="Georgia,serif">†</text>
      `
    case 'jordan':
      return `
        <path d="M0 30 Q25 45 50 30 T100 32 V56 H0Z" fill="${a}" opacity=".45"/>
        <rect x="46" y="18" width="8" height="20" fill="${L}" opacity=".7"/>
        <path d="M42 18 h16 l-2 4 h-12z" fill="${a}"/>
        <circle cx="50" cy="14" r="3" fill="${L}" opacity=".5"/>
      `
    case 'idol':
      return `
        <ellipse cx="50" cy="46" rx="18" ry="6" fill="${L}" opacity=".2"/>
        <ellipse cx="50" cy="34" rx="12" ry="10" fill="${a}" opacity=".7"/>
        <circle cx="50" cy="20" r="8" fill="${a}" opacity=".8"/>
        <path d="M42 20 q8 -12 16 0" fill="${a}"/>
        <circle cx="47" cy="19" r="1.2" fill="${p.to}"/>
        <circle cx="53" cy="19" r="1.2" fill="${p.to}"/>
      `
    default:
      return `
        <circle cx="50" cy="26" r="12" fill="${L}" opacity=".3"/>
        <path d="M0 42 Q50 30 100 42 V56 H0Z" fill="${a}" opacity=".3"/>
      `
  }
}

function buildIllustration(story, width, height) {
  const p = palette(story)
  const w = Math.max(320, Math.round(width))
  const h = Math.max(180, Math.round(height))
  const lines = wrap(story?.headline || 'Verse News', w > 700 ? 34 : 26, 2)
  const kicker = esc(
    String(story?.tag || story?.contentType || 'REPORT').toUpperCase().slice(0, 18),
  )
  const ref = esc(String(story?.ref || story?.book || '').slice(0, 28))
  const titleSvg = lines
    .map(
      (line, i) =>
        `<text x="48" y="${h - 56 + i * (w > 700 ? 36 : 28)}" fill="#fff" font-family="Georgia, serif" font-size="${w > 700 ? 28 : 20}" font-weight="700">${esc(line)}</text>`,
    )
    .join('')

  // Scene drawn in 100×56 space, scaled to full art area
  const art = sceneArt(p.scene, p)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(story?.headline || 'Story illustration')}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="#000" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${w * 0.82}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.28}" fill="${p.accent}" opacity="0.18" filter="url(#soft)"/>
  <g transform="translate(0,0) scale(${w / 100}, ${h / 56})">${art}</g>
  <rect width="100%" height="100%" fill="url(#shade)"/>
  <text x="48" y="42" fill="${p.accent}" font-family="Arial,sans-serif" font-size="${Math.max(11, Math.round(w / 70))}" font-weight="800" letter-spacing="3">VERSE NEWS · ${kicker}</text>
  <text x="48" y="68" fill="rgba(255,255,255,.7)" font-family="Arial,sans-serif" font-size="${Math.max(10, Math.round(w / 90))}" letter-spacing="1.5">${ref}</text>
  ${titleSvg}
</svg>`
}

/**
 * @param {object} story
 * @param {number} [width]
 * @param {number} [height]
 * @returns {string|null}
 */
function cmsImageUrl(story) {
  const raw = story?.image_url || story?.imageUrl || null
  if (!raw || typeof raw !== 'string') return null
  const u = raw.trim()
  if (!u) return null
  // Absolute remote
  if (/^https?:\/\//i.test(u)) return u
  // Local gallery / story-art path from CMS
  if (u.startsWith('/story-art/')) return u
  if (u.startsWith('story-art/')) return `/${u}`
  return null
}

export function resolveStoryImage(story, width = 1200, height = 675) {
  if (!story) return null
  const w = Math.max(80, Math.round(width))
  const h = Math.max(80, Math.round(height))
  const key = `${story.id || story.headline}::${w}::${h}::v4ill`
  if (cache.has(key)) return cache.get(key)

  const cms = cmsImageUrl(story)

  // Live wire: prefer publisher image
  if (story.isRealNews && cms) {
    cache.set(key, cms)
    return cms
  }

  // Gallery-aligned local plates (scripture / event match)
  const plate = getImagineArtUrl(story)
  if (plate) {
    cache.set(key, plate)
    return plate
  }

  // CMS image when no local plate
  if (cms) {
    cache.set(key, cms)
    return cms
  }

  // Last-resort inline SVG
  const svg = buildIllustration(story, w, h)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  cache.set(key, url)
  return url
}

export function generatedStoryArt(story, width = 1200, height = 675) {
  return resolveStoryImage(story, width, height)
}

export function getStoryScene(story) {
  return pickScene(story)
}
