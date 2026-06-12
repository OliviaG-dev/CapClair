const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const readTurnstileSiteKey = () => {
  const candidates = [process.env.TURNSTILE_SITE_KEY, process.env.VITE_TURNSTILE_SITE_KEY]

  for (const candidate of candidates) {
    if (isNonEmptyString(candidate)) {
      return candidate.trim()
    }
  }

  return null
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Cache-Control', 'public, max-age=300')
  return res.status(200).json({
    turnstileSiteKey: readTurnstileSiteKey(),
  })
}
