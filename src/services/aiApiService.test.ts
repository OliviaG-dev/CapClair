import { describe, expect, it } from 'vitest'
import { isSynthesisConfigError } from './aiApiService'

describe('isSynthesisConfigError', () => {
  it('flags auth and turnstile misconfiguration errors', () => {
    expect(isSynthesisConfigError(401)).toBe(true)
    expect(isSynthesisConfigError(403)).toBe(true)
  })

  it('allows local fallback for unavailable API responses', () => {
    expect(isSynthesisConfigError(404)).toBe(false)
    expect(isSynthesisConfigError(500)).toBe(false)
    expect(isSynthesisConfigError(0)).toBe(false)
  })
})
