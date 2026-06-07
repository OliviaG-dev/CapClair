import { describe, expect, it } from 'vitest'
import { splitTextIntoSentences } from './splitTextIntoSentences'

describe('splitTextIntoSentences', () => {
  it('splits text on sentence punctuation', () => {
    expect(
      splitTextIntoSentences('Je veux avancer. Le flou me freine. Je cherche un cap.'),
    ).toEqual(['Je veux avancer.', 'Le flou me freine.', 'Je cherche un cap.'])
  })

  it('splits text on line breaks', () => {
    expect(splitTextIntoSentences('Premiere phrase\nDeuxieme phrase')).toEqual([
      'Premiere phrase',
      'Deuxieme phrase',
    ])
  })

  it('returns a single line when no delimiter is found', () => {
    expect(splitTextIntoSentences('Une seule idee')).toEqual(['Une seule idee'])
  })
})
