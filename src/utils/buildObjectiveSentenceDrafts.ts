import { splitTextIntoSentences } from './splitTextIntoSentences'

export type ObjectiveSentenceDraft = {
  sentence: string
  actionLabel: string
}

const capitalizeFirst = (text: string) => {
  if (!text) {
    return text
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

const normalizeSentenceKey = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim()

export function buildObjectiveSentenceDrafts(
  sources: Array<{ text: string; actionLabel: string }>,
  maxCount = 12,
): ObjectiveSentenceDraft[] {
  const seen = new Set<string>()
  const drafts: ObjectiveSentenceDraft[] = []

  for (const source of sources) {
    const trimmedSource = source.text.trim()
    if (!trimmedSource) {
      continue
    }

    const splitSentences = splitTextIntoSentences(trimmedSource)
    const candidates = splitSentences.length > 0 ? splitSentences : [trimmedSource]

    for (const [sentenceIndex, rawSentence] of candidates.entries()) {
      let normalized = rawSentence.trim().replace(/\.$/, '')
      if (sentenceIndex === 0) {
        normalized = normalized.replace(/^je veux\s+/i, '')
      }

      const cleaned = capitalizeFirst(normalized)
      const key = normalizeSentenceKey(cleaned)

      if (!key || seen.has(key)) {
        continue
      }

      seen.add(key)
      drafts.push({
        sentence: cleaned,
        actionLabel: source.actionLabel,
      })

      if (drafts.length >= maxCount) {
        return drafts
      }
    }
  }

  return drafts
}
