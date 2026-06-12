import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTurnstileSiteKey } from './publicConfigService'

describe('fetchTurnstileSiteKey', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns trimmed site key from public config', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ turnstileSiteKey: '  site-key-test  ' }),
      }),
    )

    await expect(fetchTurnstileSiteKey()).resolves.toBe('site-key-test')
  })

  it('returns empty string when public config is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    )

    await expect(fetchTurnstileSiteKey()).resolves.toBe('')
  })
})
