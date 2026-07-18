/** Canonical Protestant 66-book list: [slug, name, chapters, testament] */
export const BIBLE_BOOKS = [
  ['genesis', 'Genesis', 50, 'Old Testament'],
  ['exodus', 'Exodus', 40, 'Old Testament'],
  ['leviticus', 'Leviticus', 27, 'Old Testament'],
  ['numbers', 'Numbers', 36, 'Old Testament'],
  ['deuteronomy', 'Deuteronomy', 34, 'Old Testament'],
  ['joshua', 'Joshua', 24, 'Old Testament'],
  ['judges', 'Judges', 21, 'Old Testament'],
  ['ruth', 'Ruth', 4, 'Old Testament'],
  ['1samuel', '1 Samuel', 31, 'Old Testament'],
  ['2samuel', '2 Samuel', 24, 'Old Testament'],
  ['1kings', '1 Kings', 22, 'Old Testament'],
  ['2kings', '2 Kings', 25, 'Old Testament'],
  ['1chronicles', '1 Chronicles', 29, 'Old Testament'],
  ['2chronicles', '2 Chronicles', 36, 'Old Testament'],
  ['ezra', 'Ezra', 10, 'Old Testament'],
  ['nehemiah', 'Nehemiah', 13, 'Old Testament'],
  ['esther', 'Esther', 10, 'Old Testament'],
  ['job', 'Job', 42, 'Old Testament'],
  ['psalms', 'Psalms', 150, 'Old Testament'],
  ['proverbs', 'Proverbs', 31, 'Old Testament'],
  ['ecclesiastes', 'Ecclesiastes', 12, 'Old Testament'],
  ['songofsolomon', 'Song of Solomon', 8, 'Old Testament'],
  ['isaiah', 'Isaiah', 66, 'Old Testament'],
  ['jeremiah', 'Jeremiah', 52, 'Old Testament'],
  ['lamentations', 'Lamentations', 5, 'Old Testament'],
  ['ezekiel', 'Ezekiel', 48, 'Old Testament'],
  ['daniel', 'Daniel', 12, 'Old Testament'],
  ['hosea', 'Hosea', 14, 'Old Testament'],
  ['joel', 'Joel', 3, 'Old Testament'],
  ['amos', 'Amos', 9, 'Old Testament'],
  ['obadiah', 'Obadiah', 1, 'Old Testament'],
  ['jonah', 'Jonah', 4, 'Old Testament'],
  ['micah', 'Micah', 7, 'Old Testament'],
  ['nahum', 'Nahum', 3, 'Old Testament'],
  ['habakkuk', 'Habakkuk', 3, 'Old Testament'],
  ['zephaniah', 'Zephaniah', 3, 'Old Testament'],
  ['haggai', 'Haggai', 2, 'Old Testament'],
  ['zechariah', 'Zechariah', 14, 'Old Testament'],
  ['malachi', 'Malachi', 4, 'Old Testament'],
  ['matthew', 'Matthew', 28, 'New Testament'],
  ['mark', 'Mark', 16, 'New Testament'],
  ['luke', 'Luke', 24, 'New Testament'],
  ['john', 'John', 21, 'New Testament'],
  ['acts', 'Acts', 28, 'New Testament'],
  ['romans', 'Romans', 16, 'New Testament'],
  ['1corinthians', '1 Corinthians', 16, 'New Testament'],
  ['2corinthians', '2 Corinthians', 13, 'New Testament'],
  ['galatians', 'Galatians', 6, 'New Testament'],
  ['ephesians', 'Ephesians', 6, 'New Testament'],
  ['philippians', 'Philippians', 4, 'New Testament'],
  ['colossians', 'Colossians', 4, 'New Testament'],
  ['1thessalonians', '1 Thessalonians', 5, 'New Testament'],
  ['2thessalonians', '2 Thessalonians', 3, 'New Testament'],
  ['1timothy', '1 Timothy', 6, 'New Testament'],
  ['2timothy', '2 Timothy', 4, 'New Testament'],
  ['titus', 'Titus', 3, 'New Testament'],
  ['philemon', 'Philemon', 1, 'New Testament'],
  ['hebrews', 'Hebrews', 13, 'New Testament'],
  ['james', 'James', 5, 'New Testament'],
  ['1peter', '1 Peter', 5, 'New Testament'],
  ['2peter', '2 Peter', 3, 'New Testament'],
  ['1john', '1 John', 5, 'New Testament'],
  ['2john', '2 John', 1, 'New Testament'],
  ['3john', '3 John', 1, 'New Testament'],
  ['jude', 'Jude', 1, 'New Testament'],
  ['revelation', 'Revelation', 22, 'New Testament'],
]

/** Flatten every chapter as { book, bookName, chapter, index } */
export function getAllBibleChapters() {
  const list = []
  let index = 0
  for (const [slug, name, chapters] of BIBLE_BOOKS) {
    for (let ch = 1; ch <= chapters; ch++) {
      list.push({ book: slug, bookName: name, chapter: ch, index: index++ })
    }
  }
  return list
}

export const BIBLE_CHAPTER_COUNT = BIBLE_BOOKS.reduce((n, b) => n + b[2], 0)
