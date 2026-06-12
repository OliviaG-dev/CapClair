import { useEffect, useState } from 'react'
import { fetchTurnstileSiteKey } from '../services/publicConfigService'

export function useTurnstileSiteKey(): string {
  const buildTimeSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const [runtimeSiteKey, setRuntimeSiteKey] = useState('')

  useEffect(() => {
    if (buildTimeSiteKey) {
      return
    }

    let cancelled = false

    fetchTurnstileSiteKey()
      .then((siteKey) => {
        if (!cancelled) {
          setRuntimeSiteKey(siteKey)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRuntimeSiteKey('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [buildTimeSiteKey])

  return buildTimeSiteKey || runtimeSiteKey
}
