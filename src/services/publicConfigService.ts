type PublicConfigResponse = {
  turnstileSiteKey?: unknown
}

export async function fetchTurnstileSiteKey(): Promise<string> {
  try {
    const response = await fetch('/api/public-config')
    if (!response.ok) {
      return ''
    }

    const payload = (await response.json()) as PublicConfigResponse
    if (typeof payload.turnstileSiteKey !== 'string') {
      return ''
    }

    return payload.turnstileSiteKey.trim()
  } catch (error) {
    console.error('Unable to load public Turnstile config', error)
    return ''
  }
}
