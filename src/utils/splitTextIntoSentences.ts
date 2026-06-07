export function splitTextIntoSentences(text: string): string[] {
  const trimmed = text.trim()

  if (!trimmed) {
    return []
  }

  return trimmed
    .split(/\n+/)
    .flatMap((paragraph) =>
      paragraph
        .split(/(?<=[.!?…])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean),
    )
}
