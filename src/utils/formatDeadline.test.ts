import { describe, expect, it } from 'vitest'
import { formatDeadline } from './formatDeadline'

describe('formatDeadline', () => {
  it('formats ISO date in French', () => {
    expect(formatDeadline('2026-12-31')).toBe('31 décembre 2026')
  })

  it('returns original value when date is invalid', () => {
    expect(formatDeadline('pas-une-date')).toBe('pas-une-date')
  })
})
