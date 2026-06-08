import { describe, expect, it } from 'vitest'
import { buildObjectiveSentenceDrafts } from './buildObjectiveSentenceDrafts'

describe('buildObjectiveSentenceDrafts', () => {
  it('creates one objective draft per sentence', () => {
    const drafts = buildObjectiveSentenceDrafts([
      {
        text: 'Je veux retrouver un sommeil régulier. Je veux moins stresser le soir.',
        actionLabel: 'Clarifier',
      },
      { text: 'Le manque de temps.', actionLabel: 'Agir sur' },
    ])

    expect(drafts).toHaveLength(3)
    expect(drafts[0].sentence).toBe('Retrouver un sommeil régulier')
    expect(drafts[1].sentence).toBe('Je veux moins stresser le soir')
    expect(drafts[2].sentence).toBe('Le manque de temps')
  })

  it('deduplicates repeated sentences across sources', () => {
    const drafts = buildObjectiveSentenceDrafts([
      { text: 'Retrouver du calme.', actionLabel: 'Clarifier' },
      { text: 'Retrouver du calme.', actionLabel: 'Renforcer' },
    ])

    expect(drafts).toHaveLength(1)
  })

  it('respects maxCount', () => {
    const drafts = buildObjectiveSentenceDrafts(
      [{ text: 'Un. Deux. Troix. Quatre.', actionLabel: 'Clarifier' }],
      2,
    )

    expect(drafts).toHaveLength(2)
  })
})
