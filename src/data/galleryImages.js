/**
 * Standalone image gallery catalog.
 * Not linked to articles — add more entries anytime.
 *
 * Fields:
 *  id, src, title, category, era (optional), credit (optional)
 */

export const GALLERY_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'genesis', label: 'Genesis' },
  { key: 'exodus', label: 'Exodus' },
  { key: 'history', label: 'History & Kings' },
  { key: 'gospels', label: 'Gospels' },
  { key: 'acts', label: 'Acts & Church' },
  { key: 'scenes', label: 'Biblical Scenes' },
]

/**
 * Seed plates on disk — titles describe what each file shows.
 * Article resolver matches these same files via scripture (storyArtMap) + id index.
 * Keep src paths exact: /story-art/story-N.jpg and /story-art/id-N.jpg
 */
export const GALLERY_IMAGES = [
  // Genesis event plates (story-1…4) + id upgrades
  { id: 'g1', src: '/story-art/story-1.jpg', title: 'The Ark in the Storm', category: 'genesis', era: 'Primeval', eventId: 1 },
  { id: 'g2', src: '/story-art/story-2.jpg', title: 'Cities of the Plain', category: 'genesis', era: 'Patriarchs', eventId: 2 },
  { id: 'g3', src: '/story-art/story-3.jpg', title: 'Moriah — Ram in the Thicket', category: 'genesis', era: 'Patriarchs', eventId: 3 },
  { id: 'g4', src: '/story-art/story-4.jpg', title: 'Joseph Sold', category: 'genesis', era: 'Patriarchs', eventId: 4 },
  { id: 'g5', src: '/story-art/id-23.jpg', title: 'Let There Be Light', category: 'genesis', era: 'Creation', storyId: 23 },
  { id: 'g6', src: '/story-art/id-24.jpg', title: 'Garden of Eden', category: 'genesis', era: 'Creation', storyId: 24 },
  { id: 'g7', src: '/story-art/id-26.jpg', title: 'Two Brothers, Two Offerings', category: 'genesis', era: 'Primeval', storyId: 26 },
  { id: 'g8', src: '/story-art/id-30.jpg', title: 'Tower of Babel', category: 'genesis', era: 'Primeval', storyId: 30 },
  { id: 'g9', src: '/story-art/id-31.jpg', title: 'Call of Abram', category: 'genesis', era: 'Patriarchs', storyId: 31 },

  // Exodus
  { id: 'e1', src: '/story-art/story-5.jpg', title: 'Plagues on Egypt', category: 'exodus', era: 'Exodus', eventId: 5 },
  { id: 'e2', src: '/story-art/story-6.jpg', title: 'Sea Parts', category: 'exodus', era: 'Exodus', eventId: 6 },
  { id: 'e3', src: '/story-art/story-7.jpg', title: 'Sinai in Fire', category: 'exodus', era: 'Exodus', eventId: 7 },
  { id: 'e4', src: '/story-art/story-8.jpg', title: 'Golden Calf', category: 'exodus', era: 'Exodus', eventId: 8 },

  // History & prophets
  { id: 'h1', src: '/story-art/story-13.jpg', title: 'Ark at the Jordan', category: 'history', era: 'Conquest', eventId: 13 },
  { id: 'h2', src: '/story-art/story-14.jpg', title: 'Walls of Jericho', category: 'history', era: 'Conquest', eventId: 14 },
  { id: 'h3', src: '/story-art/story-15.jpg', title: 'Ehud before the King', category: 'history', era: 'Judges', eventId: 15 },
  { id: 'h4', src: '/story-art/story-16.jpg', title: 'Samuel Hears the Call', category: 'history', era: 'United Kingdom', eventId: 16 },
  { id: 'h5', src: '/story-art/story-17.jpg', title: 'David and Goliath', category: 'history', era: 'United Kingdom', eventId: 17 },
  { id: 'h6', src: '/story-art/story-18.jpg', title: 'Nathan Confronts David', category: 'history', era: 'United Kingdom', eventId: 18 },
  { id: 'h7', src: '/story-art/story-19.jpg', title: 'Glory Fills the Temple', category: 'history', era: 'United Kingdom', eventId: 19 },
  { id: 'h8', src: '/story-art/story-9.jpg', title: 'Fire on Carmel', category: 'history', era: 'Prophets', eventId: 9 },
  { id: 'h9', src: '/story-art/story-20.jpg', title: 'Still Small Voice', category: 'history', era: 'Prophets', eventId: 20 },
  { id: 'h10', src: '/story-art/story-21.jpg', title: 'Chariot of Fire', category: 'history', era: 'Prophets', eventId: 21 },
  { id: 'h11', src: '/story-art/story-22.jpg', title: 'Angel over the Camp', category: 'history', era: 'Kings', eventId: 22 },

  // Gospels & Acts
  { id: 'n1', src: '/story-art/story-10.jpg', title: 'Five Thousand Fed', category: 'gospels', era: 'Ministry of Jesus', eventId: 10 },
  { id: 'n2', src: '/story-art/story-11.jpg', title: 'Lazarus Come Forth', category: 'gospels', era: 'Ministry of Jesus', eventId: 11 },
  { id: 'n3', src: '/story-art/story-12.jpg', title: 'Wind and Fire — Pentecost', category: 'acts', era: 'Early Church', eventId: 12 },
]

export function filterGalleryImages({ category = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase()
  return GALLERY_IMAGES.filter((img) => {
    if (category !== 'all' && img.category !== category) return false
    if (!q) return true
    const blob = [img.title, img.category, img.era, img.credit].filter(Boolean).join(' ').toLowerCase()
    return blob.includes(q)
  })
}
