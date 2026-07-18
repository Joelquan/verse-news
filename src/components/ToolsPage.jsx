import React, { useEffect, useMemo, useState } from 'react'
import { TICKER_VERSES } from '../data/tickerLines.js'
import { getTickerLine } from '../data/tickerLines.js'

const BOOK_SLUGS = {
  genesis: 'genesis', exodus: 'exodus', leviticus: 'leviticus', numbers: 'numbers',
  deuteronomy: 'deuteronomy', joshua: 'joshua', judges: 'judges', ruth: 'ruth',
  '1 samuel': '1samuel', '2 samuel': '2samuel', '1 kings': '1kings', '2 kings': '2kings',
  '1 chronicles': '1chronicles', '2 chronicles': '2chronicles', ezra: 'ezra', nehemiah: 'nehemiah',
  esther: 'esther', job: 'job', psalm: 'psalms', psalms: 'psalms', proverbs: 'proverbs',
  ecclesiastes: 'ecclesiastes', 'song of solomon': 'songofsolomon', 'song of songs': 'songofsolomon',
  isaiah: 'isaiah', jeremiah: 'jeremiah', lamentations: 'lamentations', ezekiel: 'ezekiel',
  daniel: 'daniel', hosea: 'hosea', joel: 'joel', amos: 'amos', obadiah: 'obadiah',
  jonah: 'jonah', micah: 'micah', nahum: 'nahum', habakkuk: 'habakkuk', zephaniah: 'zephaniah',
  haggai: 'haggai', zechariah: 'zechariah', malachi: 'malachi',
  matthew: 'matthew', mark: 'mark', luke: 'luke', john: 'john', acts: 'acts',
  romans: 'romans', '1 corinthians': '1corinthians', '2 corinthians': '2corinthians',
  galatians: 'galatians', ephesians: 'ephesians', philippians: 'philippians', colossians: 'colossians',
  '1 thessalonians': '1thessalonians', '2 thessalonians': '2thessalonians',
  '1 timothy': '1timothy', '2 timothy': '2timothy', titus: 'titus', philemon: 'philemon',
  hebrews: 'hebrews', james: 'james', '1 peter': '1peter', '2 peter': '2peter',
  '1 john': '1john', '2 john': '2john', '3 john': '3john', jude: 'jude', revelation: 'revelation',
}

const SEVENS = [
  { title: 'Seven days of creation', ref: 'Genesis 1–2', note: 'Work and rest patterned into the week.' },
  { title: 'Seven churches', ref: 'Revelation 2–3', note: 'Letters to Asia Minor assemblies.' },
  { title: 'Seven seals', ref: 'Revelation 6–8', note: 'Scroll judgments unveiled.' },
  { title: 'Seven trumpets', ref: 'Revelation 8–11', note: 'Warnings that escalate.' },
  { title: 'Seven bowls', ref: 'Revelation 15–16', note: 'Final plagues of wrath.' },
  { title: 'Seven feasts of Israel', ref: 'Leviticus 23', note: 'Sacred calendar of worship.' },
  { title: 'Seven “I am” sayings (John)', ref: 'John 6–15', note: 'Bread, light, door, shepherd, resurrection, way, vine.' },
]

const TWELVES = [
  { title: 'Twelve tribes of Israel', ref: 'Genesis 49 · Revelation 7', note: 'Foundation of the people of God.' },
  { title: 'Twelve apostles', ref: 'Matthew 10 · Acts 1', note: 'Witnesses sent by Jesus.' },
  { title: 'Twelve stones of the high priest', ref: 'Exodus 28', note: 'Names borne on the breastpiece.' },
  { title: 'Twelve gates of the New Jerusalem', ref: 'Revelation 21', note: 'Named for the tribes.' },
  { title: 'Twelve foundations of the wall', ref: 'Revelation 21', note: 'Named for the apostles.' },
  { title: 'Twelve baskets leftover', ref: 'Matthew 14', note: 'Abundance after the feeding.' },
]

const READING_PLANS = [
  { id: '30', label: '30 days', chaptersPerDay: 40, blurb: 'Fast overview — intense pace.' },
  { id: '90', label: '90 days', chaptersPerDay: 14, blurb: 'One season through the whole Bible.' },
  { id: '365', label: '365 days', chaptersPerDay: 4, blurb: 'Classic year-through plan.' },
]
const BIBLE_CHAPTERS = 1189

function format(n) {
  return Number.isFinite(n)
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
    : '—'
}

function parseBibleRef(input) {
  const s = String(input || '').trim().replace(/\s+/g, ' ')
  if (!s) return null
  const m = s.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+){0,2})\s+(\d+)(?::(\d+))?/i)
  if (!m) return null
  const bookName = m[1].toLowerCase().replace(/\s+/g, ' ').trim()
  const slug = BOOK_SLUGS[bookName] || BOOK_SLUGS[bookName.replace(/\s/g, '')]
  if (!slug) return null
  return {
    book: slug,
    chapter: Number(m[2]),
    verse: m[3] ? Number(m[3]) : 1,
    display: s,
  }
}

function loadPlan() {
  try {
    return JSON.parse(localStorage.getItem('vn-reading-plan') || 'null')
  } catch {
    return null
  }
}

function savePlan(plan) {
  try {
    localStorage.setItem('vn-reading-plan', JSON.stringify(plan))
  } catch { /* ignore */ }
}

function ToolCard({ kicker, title, hint, children, wide }) {
  return (
    <article className={`vn-tool-card${wide ? ' is-wide' : ''}`}>
      <header className="vn-tool-card-head">
        {kicker && <p className="vn-tool-card-kicker">{kicker}</p>}
        <h2 className="vn-tool-card-title">{title}</h2>
        {hint && <p className="vn-tool-card-hint">{hint}</p>}
      </header>
      <div className="vn-tool-card-body">{children}</div>
    </article>
  )
}

function Field({ label, children }) {
  return (
    <label className="vn-tool-field">
      {label && <span className="vn-tool-label">{label}</span>}
      {children}
    </label>
  )
}

function Result({ label, children, large }) {
  return (
    <div className={`vn-tool-out${large ? ' is-large' : ''}`} role="status">
      {label && <span className="vn-tool-out-label">{label}</span>}
      <div className="vn-tool-out-value">{children}</div>
    </div>
  )
}

export default function ToolsPage({ onClose, openBibleReference }) {
  const [category, setCategory] = useState('scripture')
  const [query, setQuery] = useState('')
  const [clock, setClock] = useState(() => new Date())

  // Everyday
  const [expr, setExpr] = useState('')
  const [calcResult, setCalcResult] = useState('0')
  const [pct, setPct] = useState({ part: '', whole: '' })
  const [tip, setTip] = useState({ bill: '', rate: '18', people: '1' })

  // Money
  const [loan, setLoan] = useState({ amount: '', rate: '', years: '' })
  const [mortgage, setMortgage] = useState({ price: '', down: '20', rate: '', years: '30', tax: '', insurance: '', hoa: '' })
  const [afford, setAfford] = useState({ income: '', debts: '', down: '', rate: '6.5', years: '30' })
  const [debt, setDebt] = useState({ balance: '', rate: '', payment: '' })
  const [goal, setGoal] = useState({ target: '', start: '', rate: '', years: '' })
  const [savings, setSavings] = useState({ start: '', monthly: '', rate: '', years: '' })
  const [tithe, setTithe] = useState({ income: '', percent: '10' })

  // Health
  const [bmi, setBmi] = useState({ weight: '', height: '' })
  const [water, setWater] = useState({ weight: '', activity: 'moderate' })

  // Convert
  const [conv, setConv] = useState({ value: '1', from: 'mi', to: 'km' })

  // Time
  const [dateA, setDateA] = useState('')
  const [dateB, setDateB] = useState('')

  // Writing
  const [words, setWords] = useState('')
  const [password, setPassword] = useState('')
  const [passwordLength, setPasswordLength] = useState(16)
  const [copied, setCopied] = useState(false)

  // Scripture tools
  const [bibleRef, setBibleRef] = useState('John 3:16')
  const [refError, setRefError] = useState('')
  const [plan, setPlan] = useState(() => loadPlan() || { id: '365', day: 1, start: new Date().toISOString().slice(0, 10) })
  const [memoryText, setMemoryText] = useState('')
  const [focusMin, setFocusMin] = useState(10)
  const [focusLeft, setFocusLeft] = useState(0)
  const [focusRunning, setFocusRunning] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!focusRunning || focusLeft <= 0) {
      if (focusLeft <= 0 && focusRunning) setFocusRunning(false)
      return undefined
    }
    const t = setInterval(() => setFocusLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [focusRunning, focusLeft])

  useEffect(() => {
    savePlan(plan)
  }, [plan])

  const dailyLine = useMemo(() => getTickerLine(clock), [clock])
  const randomVerse = useMemo(() => {
    const i = Math.floor((clock.getTime() / 60000) % TICKER_VERSES.length)
    return TICKER_VERSES[i] || TICKER_VERSES[0]
  }, [clock])

  const categories = [
    { id: 'scripture', label: 'Scripture', emoji: '📖', count: 6 },
    { id: 'everyday', label: 'Everyday', emoji: '⚡', count: 3 },
    { id: 'money', label: 'Money', emoji: '💰', count: 7 },
    { id: 'health', label: 'Health', emoji: '💚', count: 2 },
    { id: 'convert', label: 'Convert', emoji: '⇄', count: 1 },
    { id: 'time', label: 'Time', emoji: '⏱', count: 3 },
    { id: 'writing', label: 'Writing', emoji: '✏️', count: 2 },
  ]

  const calculate = () => {
    try {
      if (!/^[0-9+\-*/().%\s]+$/.test(expr)) throw new Error()
      const v = Function(`"use strict";return (${expr.replace(/%/g, '/100')})`)()
      if (!Number.isFinite(v)) throw new Error()
      setCalcResult(String(Math.round((v + Number.EPSILON) * 1e10) / 1e10))
    } catch {
      setCalcResult('Invalid expression')
    }
  }

  const conversions = {
    mi: { km: 1.609344, m: 1609.344, ft: 5280 },
    km: { mi: 0.621371, m: 1000, ft: 3280.84 },
    m: { km: 0.001, mi: 0.000621371, ft: 3.28084 },
    ft: { m: 0.3048, km: 0.0003048, mi: 0.000189394 },
    lb: { kg: 0.453592, oz: 16 },
    kg: { lb: 2.20462, oz: 35.274 },
    oz: { lb: 0.0625, kg: 0.0283495 },
    gal: { l: 3.78541 },
    l: { gal: 0.264172 },
    f: { c: null },
    c: { f: null },
  }

  const convert = () => {
    const v = parseFloat(conv.value)
    if (!Number.isFinite(v)) return 'Enter a number'
    if (conv.from === conv.to) return v
    if (conv.from === 'f' && conv.to === 'c') return (v - 32) * 5 / 9
    if (conv.from === 'c' && conv.to === 'f') return v * 9 / 5 + 32
    const factor = conversions[conv.from]?.[conv.to]
    return factor ? v * factor : 'Choose compatible units'
  }

  const amortizedPayment = (P, annualRate, years) => {
    const r = Number(annualRate) / 1200
    const n = Number(years) * 12
    if (!(P > 0 && n > 0)) return 0
    if (r === 0) return P / n
    return P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  }

  const monthlyPayment = () => amortizedPayment(Number(loan.amount), loan.rate, loan.years)

  const mortgageDetails = () => {
    const price = Number(mortgage.price) || 0
    const downPct = Math.max(0, Number(mortgage.down) || 0)
    const principal = Math.max(0, price * (1 - downPct / 100))
    const pi = amortizedPayment(principal, mortgage.rate, mortgage.years)
    const extras = ((Number(mortgage.tax) || 0) + (Number(mortgage.insurance) || 0)) / 12 + (Number(mortgage.hoa) || 0)
    return { principal, pi, total: pi + extras, interest: Math.max(0, pi * Number(mortgage.years) * 12 - principal) }
  }

  const affordability = () => {
    const monthlyIncome = (Number(afford.income) || 0) / 12
    const room = Math.max(0, monthlyIncome * 0.36 - (Number(afford.debts) || 0))
    const r = Number(afford.rate) / 1200
    const n = Number(afford.years) * 12
    const loanSize = room > 0
      ? (r ? room * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : room * n)
      : 0
    return { payment: room, home: loanSize + (Number(afford.down) || 0) }
  }

  const debtPayoff = () => {
    const balance = Number(debt.balance) || 0
    const r = Number(debt.rate) / 1200
    const payment = Number(debt.payment) || 0
    if (!(balance > 0 && payment > 0)) return null
    if (r === 0) return { months: Math.ceil(balance / payment), interest: 0 }
    if (payment <= balance * r) return { months: Infinity, interest: Infinity }
    const months = Math.ceil(-Math.log(1 - r * balance / payment) / Math.log(1 + r))
    return { months, interest: payment * months - balance }
  }

  const savingsGoal = () => {
    const target = Number(goal.target) || 0
    const start = Number(goal.start) || 0
    const r = Number(goal.rate) / 1200
    const n = Number(goal.years) * 12
    if (!(target > 0 && n > 0)) return 0
    const futureStart = start * Math.pow(1 + r, n)
    return Math.max(0, r ? (target - futureStart) * r / (Math.pow(1 + r, n) - 1) : (target - start) / n)
  }

  const savingsTotal = () => {
    const initial = Number(savings.start) || 0
    const monthly = Number(savings.monthly) || 0
    const r = Number(savings.rate) / 1200
    const n = Number(savings.years) * 12
    if (n <= 0) return initial
    return initial * Math.pow(1 + r, n) + (r ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n)
  }

  const bmiValue = () => {
    const w = Number(bmi.weight)
    const h = Number(bmi.height)
    return w > 0 && h > 0 ? 703 * w / (h * h) : 0
  }

  const waterOz = () => {
    const w = Number(water.weight)
    if (!(w > 0)) return 0
    const base = w * 0.5
    const bonus = water.activity === 'high' ? 24 : water.activity === 'moderate' ? 12 : 0
    return base + bonus
  }

  const dateDiff = () => {
    if (!dateA || !dateB) return null
    const a = new Date(`${dateA}T12:00:00`)
    const b = new Date(`${dateB}T12:00:00`)
    return Math.abs(Math.round((b - a) / 86400000))
  }

  const wordStats = useMemo(() => {
    const trimmed = words.trim()
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = words.length
    const charsNoSpace = words.replace(/\s/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || 1 : 0
    const minutes = wordCount ? Math.max(1, Math.ceil(wordCount / 225)) : 0
    return { wordCount, chars, charsNoSpace, sentences, minutes }
  }, [words])

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    let out = ''
    if (window.crypto?.getRandomValues) {
      const arr = new Uint32Array(passwordLength)
      window.crypto.getRandomValues(arr)
      out = Array.from(arr, (n) => chars[n % chars.length]).join('')
    } else {
      for (let i = 0; i < passwordLength; i++) out += chars[Math.floor(Math.random() * chars.length)]
    }
    setPassword(out)
    setCopied(false)
  }

  const openRef = () => {
    const parsed = parseBibleRef(bibleRef)
    if (!parsed) {
      setRefError('Try a reference like John 3:16 or Psalm 23')
      return
    }
    setRefError('')
    if (typeof openBibleReference === 'function') {
      openBibleReference({ book: parsed.book, chapter: parsed.chapter, verse: parsed.verse })
    }
  }

  const planMeta = READING_PLANS.find((p) => p.id === plan.id) || READING_PLANS[2]
  const planProgress = Math.min(100, Math.round(((Number(plan.day) || 1) - 1) / (Number(plan.id) || 365) * 100))
  const chaptersDone = Math.min(BIBLE_CHAPTERS, Math.max(0, (Number(plan.day) || 1) - 1) * planMeta.chaptersPerDay)
  const chaptersTodayStart = chaptersDone + 1
  const chaptersTodayEnd = Math.min(BIBLE_CHAPTERS, chaptersDone + planMeta.chaptersPerDay)

  const jerusalemTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: 'Asia/Jerusalem',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(clock)
    } catch {
      return '—'
    }
  }, [clock])

  const focusDisplay = `${String(Math.floor(focusLeft / 60)).padStart(2, '0')}:${String(focusLeft % 60).padStart(2, '0')}`

  const q = query.trim().toLowerCase()
  const match = (text) => !q || String(text).toLowerCase().includes(q)

  const showScripture = category === 'scripture' && match('scripture bible reading plan verse sevens twelves focus prayer memory')
  const showEveryday = category === 'everyday' && match('calculator percent tip bill')
  const showMoney = category === 'money' && match('mortgage loan debt savings tithe afford money')
  const showHealth = category === 'health' && match('bmi water health')
  const showConvert = category === 'convert' && match('convert unit mile')
  const showTime = category === 'time' && match('date time jerusalem clock')
  const showWriting = category === 'writing' && match('word password writing read')

  return (
    <main className="tools-page vn-tools-desk">
      <button type="button" className="vn-tools-back" onClick={onClose}>← Back to news</button>

      <header className="vn-tools-hero">
        <div className="vn-tools-hero-copy">
          <p className="vn-tools-kicker">Tools desk</p>
          <h1>Utilities that serve the reader</h1>
          <p>
            Scripture helpers first — then practical calculators that run in your browser.
            No account. No upload. Results stay on your device.
          </p>
        </div>
        <div className="vn-tools-hero-aside" aria-label="Today’s line">
          <span className="vn-tools-hero-badge">{dailyLine.kind === 'verse' ? 'Scripture' : 'Quote'}</span>
          <p>“{(dailyLine.text || '').slice(0, 110)}{(dailyLine.text || '').length > 110 ? '…' : ''}”</p>
          <em>— {dailyLine.ref}</em>
        </div>
      </header>

      <div className="vn-tools-toolbar">
        <div className="vn-tools-search-wrap">
          <input
            className="vn-tools-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
          />
        </div>
        <nav className="vn-tools-cats" aria-label="Tool categories">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`vn-tools-cat${category === c.id ? ' is-on' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              <span aria-hidden>{c.emoji}</span>
              <strong>{c.label}</strong>
              <em>{c.count}</em>
            </button>
          ))}
        </nav>
      </div>

      <section className="vn-tools-grid" aria-live="polite">
        {/* ── SCRIPTURE ─────────────────────────────────────── */}
        {showScripture && (
          <>
            <ToolCard
              kicker="Jump in"
              title="Open a Bible reference"
              hint="Type a reference and open the built-in reader."
            >
              <Field label="Reference">
                <input
                  className="vn-tool-input"
                  value={bibleRef}
                  onChange={(e) => setBibleRef(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && openRef()}
                  placeholder="e.g. John 3:16 · Psalm 23 · Romans 8"
                />
              </Field>
              {refError && <p className="vn-tool-error">{refError}</p>}
              <div className="vn-tool-actions">
                <button type="button" className="vn-tool-btn" onClick={openRef}>Open in Bible</button>
                <button
                  type="button"
                  className="vn-tool-btn is-ghost"
                  onClick={() => {
                    setBibleRef(randomVerse.ref)
                    setRefError('')
                  }}
                >
                  Use today’s sample
                </button>
              </div>
              <Result label="Sample line">
                {randomVerse.text} — {randomVerse.ref}
              </Result>
            </ToolCard>

            <ToolCard
              kicker="Habit"
              title="Bible reading plan"
              hint={`${BIBLE_CHAPTERS} chapters · pick a pace and track the day. Saved on this device.`}
            >
              <Field label="Plan length">
                <select
                  className="vn-tool-input"
                  value={plan.id}
                  onChange={(e) => setPlan((p) => ({ ...p, id: e.target.value, day: 1 }))}
                >
                  {READING_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label} · ~{p.chaptersPerDay} ch/day</option>
                  ))}
                </select>
              </Field>
              <Field label={`Day number (1–${plan.id})`}>
                <input
                  className="vn-tool-input"
                  type="number"
                  min={1}
                  max={Number(plan.id)}
                  value={plan.day}
                  onChange={(e) => setPlan((p) => ({ ...p, day: Math.max(1, Number(e.target.value) || 1) }))}
                />
              </Field>
              <div className="vn-tool-progress" aria-hidden>
                <div className="vn-tool-progress-bar" style={{ width: `${planProgress}%` }} />
              </div>
              <Result label="Today’s window (approx.)">
                Chapters {chaptersTodayStart}–{chaptersTodayEnd}
                <span className="vn-tool-sub"> · Day {plan.day} of {plan.id} · {planProgress}% through</span>
              </Result>
              <div className="vn-tool-actions">
                <button
                  type="button"
                  className="vn-tool-btn"
                  onClick={() => setPlan((p) => ({
                    ...p,
                    day: Math.min(Number(p.id), (Number(p.day) || 1) + 1),
                  }))}
                >
                  Mark day done
                </button>
                <button
                  type="button"
                  className="vn-tool-btn is-ghost"
                  onClick={() => setPlan({ id: plan.id, day: 1, start: new Date().toISOString().slice(0, 10) })}
                >
                  Reset plan
                </button>
              </div>
              <p className="vn-tool-note">{planMeta.blurb} Chapter windows are approximate for pacing — pair with your preferred reading list.</p>
            </ToolCard>

            <ToolCard kicker="Focus" title="Quiet timer" hint="Short focus block for prayer or reading. Stays on this page.">
              <Field label="Minutes">
                <input
                  className="vn-tool-input"
                  type="number"
                  min={1}
                  max={120}
                  value={focusMin}
                  disabled={focusRunning}
                  onChange={(e) => setFocusMin(Math.max(1, Number(e.target.value) || 1))}
                />
              </Field>
              <Result label="Remaining" large>{focusRunning || focusLeft > 0 ? focusDisplay : `${String(focusMin).padStart(2, '0')}:00`}</Result>
              <div className="vn-tool-actions">
                {!focusRunning ? (
                  <button
                    type="button"
                    className="vn-tool-btn"
                    onClick={() => {
                      setFocusLeft(focusMin * 60)
                      setFocusRunning(true)
                    }}
                  >
                    Start
                  </button>
                ) : (
                  <button type="button" className="vn-tool-btn is-ghost" onClick={() => setFocusRunning(false)}>Pause</button>
                )}
                <button
                  type="button"
                  className="vn-tool-btn is-ghost"
                  onClick={() => {
                    setFocusRunning(false)
                    setFocusLeft(0)
                  }}
                >
                  Reset
                </button>
              </div>
            </ToolCard>

            <ToolCard kicker="Memory" title="Memory verse counter" hint="Paste a verse you are learning. Counts words and characters.">
              <Field label="Verse text">
                <textarea
                  className="vn-tool-input vn-tool-textarea"
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                  placeholder="Paste the verse you want to memorize…"
                  rows={4}
                />
              </Field>
              <Result label="Load">
                {memoryText.trim() ? memoryText.trim().split(/\s+/).length : 0} words · {memoryText.length} characters
              </Result>
            </ToolCard>

            <ToolCard kicker="Study map" title="Sevens of Scripture" hint="Quick reference for major sevens in the biblical story." wide>
              <ul className="vn-tool-list">
                {SEVENS.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.ref}</span>
                    <em>{item.note}</em>
                  </li>
                ))}
              </ul>
            </ToolCard>

            <ToolCard kicker="Study map" title="Twelves of Scripture" hint="Tribes, apostles, gates, and other twelves." wide>
              <ul className="vn-tool-list">
                {TWELVES.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.ref}</span>
                    <em>{item.note}</em>
                  </li>
                ))}
              </ul>
            </ToolCard>
          </>
        )}

        {/* ── EVERYDAY ──────────────────────────────────────── */}
        {showEveryday && (
          <>
            <ToolCard kicker="Math" title="Calculator" hint="Basic expressions. Press Enter or Calculate.">
              <Field label="Expression">
                <input
                  className="vn-tool-input"
                  value={expr}
                  onChange={(e) => setExpr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && calculate()}
                  placeholder="(25 * 4) + 10"
                />
              </Field>
              <div className="vn-tool-actions">
                <button type="button" className="vn-tool-btn" onClick={calculate}>Calculate</button>
                <button type="button" className="vn-tool-btn is-ghost" onClick={() => { setExpr(''); setCalcResult('0') }}>Reset</button>
              </div>
              <Result label="Result" large>{calcResult}</Result>
            </ToolCard>

            <ToolCard kicker="Math" title="Percentage" hint="Part ÷ whole × 100">
              <Field label="Part"><input className="vn-tool-input" type="number" value={pct.part} onChange={(e) => setPct({ ...pct, part: e.target.value })} /></Field>
              <Field label="Whole"><input className="vn-tool-input" type="number" value={pct.whole} onChange={(e) => setPct({ ...pct, whole: e.target.value })} /></Field>
              <Result label="Percentage">
                {pct.whole ? `${format((Number(pct.part) / Number(pct.whole)) * 100)}%` : '—'}
              </Result>
            </ToolCard>

            <ToolCard kicker="Money day-to-day" title="Tip & bill split" hint="Split fairly after tip.">
              <Field label="Bill total ($)"><input className="vn-tool-input" type="number" value={tip.bill} onChange={(e) => setTip({ ...tip, bill: e.target.value })} /></Field>
              <Field label="Tip %"><input className="vn-tool-input" type="number" value={tip.rate} onChange={(e) => setTip({ ...tip, rate: e.target.value })} /></Field>
              <Field label="People"><input className="vn-tool-input" type="number" min="1" value={tip.people} onChange={(e) => setTip({ ...tip, people: e.target.value })} /></Field>
              <Result label="Each pays">
                ${format(((Number(tip.bill) || 0) * (1 + (Number(tip.rate) || 0) / 100)) / Math.max(1, Number(tip.people) || 1))}
              </Result>
            </ToolCard>
          </>
        )}

        {/* ── MONEY ─────────────────────────────────────────── */}
        {showMoney && (
          <>
            <ToolCard kicker="Home" title="Mortgage estimator" hint="Principal, interest, tax, insurance, HOA.">
              <Field label="Home price"><input className="vn-tool-input" type="number" value={mortgage.price} onChange={(e) => setMortgage({ ...mortgage, price: e.target.value })} /></Field>
              <Field label="Down payment %"><input className="vn-tool-input" type="number" value={mortgage.down} onChange={(e) => setMortgage({ ...mortgage, down: e.target.value })} /></Field>
              <Field label="Interest rate %"><input className="vn-tool-input" type="number" value={mortgage.rate} onChange={(e) => setMortgage({ ...mortgage, rate: e.target.value })} /></Field>
              <Field label="Term">
                <select className="vn-tool-input" value={mortgage.years} onChange={(e) => setMortgage({ ...mortgage, years: e.target.value })}>
                  <option value="30">30 years</option>
                  <option value="20">20 years</option>
                  <option value="15">15 years</option>
                  <option value="10">10 years</option>
                </select>
              </Field>
              <Field label="Annual property tax"><input className="vn-tool-input" type="number" value={mortgage.tax} onChange={(e) => setMortgage({ ...mortgage, tax: e.target.value })} /></Field>
              <Field label="Annual insurance"><input className="vn-tool-input" type="number" value={mortgage.insurance} onChange={(e) => setMortgage({ ...mortgage, insurance: e.target.value })} /></Field>
              <Field label="Monthly HOA"><input className="vn-tool-input" type="number" value={mortgage.hoa} onChange={(e) => setMortgage({ ...mortgage, hoa: e.target.value })} /></Field>
              <Result label="Estimated total / month">${format(mortgageDetails().total)}</Result>
              <p className="vn-tool-note">P&I ${format(mortgageDetails().pi)} · Loan ${format(mortgageDetails().principal)} · Est. interest ${format(mortgageDetails().interest)}</p>
            </ToolCard>

            <ToolCard kicker="Home" title="Affordability" hint="General 36% debt-to-income guideline.">
              <Field label="Annual income"><input className="vn-tool-input" type="number" value={afford.income} onChange={(e) => setAfford({ ...afford, income: e.target.value })} /></Field>
              <Field label="Monthly debts"><input className="vn-tool-input" type="number" value={afford.debts} onChange={(e) => setAfford({ ...afford, debts: e.target.value })} /></Field>
              <Field label="Cash down"><input className="vn-tool-input" type="number" value={afford.down} onChange={(e) => setAfford({ ...afford, down: e.target.value })} /></Field>
              <Field label="Rate %"><input className="vn-tool-input" type="number" value={afford.rate} onChange={(e) => setAfford({ ...afford, rate: e.target.value })} /></Field>
              <Result label="Estimated home price">${format(affordability().home)}</Result>
              <p className="vn-tool-note">Suggested max housing payment ~${format(affordability().payment)} / mo. Lender rules vary.</p>
            </ToolCard>

            <ToolCard kicker="Borrow" title="Loan payment" hint="Standard amortizing loan.">
              <Field label="Amount"><input className="vn-tool-input" type="number" value={loan.amount} onChange={(e) => setLoan({ ...loan, amount: e.target.value })} /></Field>
              <Field label="Annual interest %"><input className="vn-tool-input" type="number" value={loan.rate} onChange={(e) => setLoan({ ...loan, rate: e.target.value })} /></Field>
              <Field label="Years"><input className="vn-tool-input" type="number" value={loan.years} onChange={(e) => setLoan({ ...loan, years: e.target.value })} /></Field>
              <Result label="Monthly">${format(monthlyPayment())}</Result>
              <p className="vn-tool-note">Total interest ~${format(Math.max(0, monthlyPayment() * Number(loan.years) * 12 - (Number(loan.amount) || 0)))}</p>
            </ToolCard>

            <ToolCard kicker="Debt" title="Debt payoff" hint="Months to clear a balance at a fixed payment.">
              <Field label="Balance"><input className="vn-tool-input" type="number" value={debt.balance} onChange={(e) => setDebt({ ...debt, balance: e.target.value })} /></Field>
              <Field label="APR %"><input className="vn-tool-input" type="number" value={debt.rate} onChange={(e) => setDebt({ ...debt, rate: e.target.value })} /></Field>
              <Field label="Monthly payment"><input className="vn-tool-input" type="number" value={debt.payment} onChange={(e) => setDebt({ ...debt, payment: e.target.value })} /></Field>
              <Result label="Payoff">
                {!debtPayoff()
                  ? 'Enter balance and payment'
                  : debtPayoff().months === Infinity
                    ? 'Payment too low to cover interest'
                    : `${debtPayoff().months} months · $${format(debtPayoff().interest)} interest`}
              </Result>
            </ToolCard>

            <ToolCard kicker="Save" title="Savings growth" hint="Compound growth with monthly contributions.">
              <Field label="Starting balance"><input className="vn-tool-input" type="number" value={savings.start} onChange={(e) => setSavings({ ...savings, start: e.target.value })} /></Field>
              <Field label="Monthly contribution"><input className="vn-tool-input" type="number" value={savings.monthly} onChange={(e) => setSavings({ ...savings, monthly: e.target.value })} /></Field>
              <Field label="Annual return %"><input className="vn-tool-input" type="number" value={savings.rate} onChange={(e) => setSavings({ ...savings, rate: e.target.value })} /></Field>
              <Field label="Years"><input className="vn-tool-input" type="number" value={savings.years} onChange={(e) => setSavings({ ...savings, years: e.target.value })} /></Field>
              <Result label="Future value">${format(savingsTotal())}</Result>
            </ToolCard>

            <ToolCard kicker="Save" title="Savings goal" hint="How much to set aside monthly to hit a target.">
              <Field label="Target"><input className="vn-tool-input" type="number" value={goal.target} onChange={(e) => setGoal({ ...goal, target: e.target.value })} /></Field>
              <Field label="Current savings"><input className="vn-tool-input" type="number" value={goal.start} onChange={(e) => setGoal({ ...goal, start: e.target.value })} /></Field>
              <Field label="Annual return %"><input className="vn-tool-input" type="number" value={goal.rate} onChange={(e) => setGoal({ ...goal, rate: e.target.value })} /></Field>
              <Field label="Years"><input className="vn-tool-input" type="number" value={goal.years} onChange={(e) => setGoal({ ...goal, years: e.target.value })} /></Field>
              <Result label="Save each month">${format(savingsGoal())}</Result>
            </ToolCard>

            <ToolCard kicker="Stewardship" title="Giving / tithe calculator" hint="A planning aid — not a rulebook. Generosity is personal and prayerful.">
              <Field label="Income amount"><input className="vn-tool-input" type="number" value={tithe.income} onChange={(e) => setTithe({ ...tithe, income: e.target.value })} /></Field>
              <Field label="Percent to give">
                <input className="vn-tool-input" type="number" min="0" max="100" value={tithe.percent} onChange={(e) => setTithe({ ...tithe, percent: e.target.value })} />
              </Field>
              <Result label="Suggested amount">
                ${format((Number(tithe.income) || 0) * (Number(tithe.percent) || 0) / 100)}
              </Result>
              <p className="vn-tool-note">Also shows ${(format((Number(tithe.income) || 0) * 0.1))} at 10% for quick comparison.</p>
            </ToolCard>
          </>
        )}

        {/* ── HEALTH ────────────────────────────────────────── */}
        {showHealth && (
          <>
            <ToolCard kicker="Screening" title="BMI estimator" hint="General screening only — not a diagnosis.">
              <Field label="Weight (lb)"><input className="vn-tool-input" type="number" value={bmi.weight} onChange={(e) => setBmi({ ...bmi, weight: e.target.value })} /></Field>
              <Field label="Height (inches)"><input className="vn-tool-input" type="number" value={bmi.height} onChange={(e) => setBmi({ ...bmi, height: e.target.value })} /></Field>
              <Result label="BMI">{bmiValue() ? format(bmiValue()) : '—'}</Result>
              <p className="vn-tool-note">BMI is a rough population metric. Talk with a clinician for personal health decisions.</p>
            </ToolCard>

            <ToolCard kicker="Habits" title="Water intake guide" hint="Rough planning formula (½ oz per lb + activity).">
              <Field label="Weight (lb)"><input className="vn-tool-input" type="number" value={water.weight} onChange={(e) => setWater({ ...water, weight: e.target.value })} /></Field>
              <Field label="Activity">
                <select className="vn-tool-input" value={water.activity} onChange={(e) => setWater({ ...water, activity: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High / hot climate</option>
                </select>
              </Field>
              <Result label="Rough daily target">
                {waterOz() ? `${format(waterOz())} fl oz (~${format(waterOz() / 8)} cups)` : '—'}
              </Result>
              <p className="vn-tool-note">Needs vary. Use thirst, urine color, and medical advice — not a universal rule.</p>
            </ToolCard>
          </>
        )}

        {/* ── CONVERT ───────────────────────────────────────── */}
        {showConvert && (
          <ToolCard kicker="Units" title="Unit converter" hint="Length, mass, volume, temperature." wide>
            <div className="vn-tool-row3">
              <Field label="Value"><input className="vn-tool-input" type="number" value={conv.value} onChange={(e) => setConv({ ...conv, value: e.target.value })} /></Field>
              <Field label="From">
                <select className="vn-tool-input" value={conv.from} onChange={(e) => setConv({ ...conv, from: e.target.value })}>
                  {[['mi', 'Miles'], ['km', 'Kilometers'], ['m', 'Meters'], ['ft', 'Feet'], ['lb', 'Pounds'], ['kg', 'Kilograms'], ['oz', 'Ounces'], ['gal', 'Gallons'], ['l', 'Liters'], ['f', '°F'], ['c', '°C']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="To">
                <select className="vn-tool-input" value={conv.to} onChange={(e) => setConv({ ...conv, to: e.target.value })}>
                  {[['km', 'Kilometers'], ['mi', 'Miles'], ['m', 'Meters'], ['ft', 'Feet'], ['kg', 'Kilograms'], ['lb', 'Pounds'], ['oz', 'Ounces'], ['l', 'Liters'], ['gal', 'Gallons'], ['c', '°C'], ['f', '°F']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Result label="Converted" large>
              {typeof convert() === 'number' ? format(convert()) : convert()}
            </Result>
          </ToolCard>
        )}

        {/* ── TIME ──────────────────────────────────────────── */}
        {showTime && (
          <>
            <ToolCard kicker="Span" title="Date difference" hint="Days between two dates.">
              <Field label="Start"><input className="vn-tool-input" type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} /></Field>
              <Field label="End"><input className="vn-tool-input" type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} /></Field>
              <Result label="Difference">
                {dateDiff() === null ? 'Choose two dates' : `${dateDiff()} days`}
              </Result>
            </ToolCard>

            <ToolCard kicker="Local" title="Your local time" hint="From this device’s clock.">
              <Result label="Now" large>
                {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Result>
              <p className="vn-tool-note">
                {clock.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </ToolCard>

            <ToolCard kicker="Bible lands" title="Jerusalem time" hint="Useful when reading maps, weather, or journeys set in the land.">
              <Result label="Asia/Jerusalem" large>{jerusalemTime}</Result>
              <p className="vn-tool-note">Live clock in Israel’s time zone — not a substitute for official sources.</p>
            </ToolCard>
          </>
        )}

        {/* ── WRITING ───────────────────────────────────────── */}
        {showWriting && (
          <>
            <ToolCard kicker="Edit" title="Word & reading counter" hint="~225 words per minute adult reading pace." wide>
              <Field label="Text">
                <textarea
                  className="vn-tool-input vn-tool-textarea"
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  placeholder="Paste a draft, sermon notes, or article…"
                  rows={7}
                />
              </Field>
              <Result label="Stats">
                {wordStats.wordCount} words · {wordStats.chars} characters · ~{wordStats.minutes} min read · ~{wordStats.sentences} sentences
              </Result>
            </ToolCard>

            <ToolCard kicker="Security" title="Password generator" hint="Random string for accounts. Store it safely.">
              <Field label={`Length: ${passwordLength}`}>
                <input
                  className="vn-tool-range"
                  type="range"
                  min="8"
                  max="40"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                />
              </Field>
              <div className="vn-tool-actions">
                <button type="button" className="vn-tool-btn" onClick={generatePassword}>Generate</button>
                <button
                  type="button"
                  className="vn-tool-btn is-ghost"
                  onClick={() => {
                    if (!password) return
                    navigator.clipboard?.writeText(password)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <Result label="Password">
                <span className="vn-tool-mono">{password || 'Generate a password to see it here'}</span>
              </Result>
            </ToolCard>
          </>
        )}
      </section>

      <footer className="vn-tools-foot">
        <p>Estimates only. Financial and health tools are educational — not professional advice. Scripture tools serve reading; they do not replace the biblical text.</p>
      </footer>
    </main>
  )
}
