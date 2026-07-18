/**
 * Vercel serverless: ElevenLabs text-to-speech proxy.
 * Keeps ELEVENLABS_API_KEY server-side only.
 *
 * Env:
 *   ELEVENLABS_API_KEY  (required)
 *   ELEVENLABS_VOICE_ID (optional, default Rachel)
 *   ELEVENLABS_MODEL_ID (optional)
 */

const MAX_CHARS = 2500
const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM' // Rachel
const DEFAULT_MODEL = 'eleven_multilingual_v2'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function bad(res, status, message) {
  cors(res)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: message }))
}

export default async function handler(req, res) {
  cors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  if (req.method !== 'POST') {
    return bad(res, 405, 'Method not allowed')
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return bad(res, 503, 'ElevenLabs is not configured. Set ELEVENLABS_API_KEY on Vercel.')
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return bad(res, 400, 'Invalid JSON body')
    }
  }
  if (!body || typeof body !== 'object') {
    // Vercel may not auto-parse in some runtimes
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf8')
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return bad(res, 400, 'Invalid JSON body')
    }
  }

  const text = String(body.text || '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return bad(res, 400, 'Missing text')
  if (text.length > MAX_CHARS) {
    return bad(res, 400, `Text too long (max ${MAX_CHARS} characters per request)`)
  }

  const voiceId = String(body.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64)
  const modelId = String(body.modelId || process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL)

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      },
    )

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '')
      let detail = ''
      try {
        const j = JSON.parse(errText)
        detail = j?.detail?.message || j?.detail || j?.message || ''
        if (typeof detail === 'object') detail = JSON.stringify(detail)
      } catch { /* ignore */ }
      const msg =
        upstream.status === 401
          ? 'ElevenLabs API key rejected — check the key in Vercel env'
          : upstream.status === 402
            ? 'ElevenLabs payment/quota (402) — add credits or upgrade your ElevenLabs plan'
            : upstream.status === 429
              ? 'ElevenLabs rate limit — try again shortly'
              : `ElevenLabs error (${upstream.status})${detail ? `: ${String(detail).slice(0, 180)}` : ''}`
      console.error('[tts]', upstream.status, errText.slice(0, 400))
      return bad(
        res,
        upstream.status === 401 ? 502 : upstream.status === 402 ? 402 : upstream.status === 429 ? 429 : 502,
        msg,
      )
    }

    const buf = Buffer.from(await upstream.arrayBuffer())
    cors(res)
    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Length', String(buf.length))
    res.end(buf)
  } catch (err) {
    console.error('[tts]', err)
    return bad(res, 500, 'TTS request failed')
  }
}
