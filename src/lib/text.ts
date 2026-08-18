export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Number of letters (a-z) in `word` that can be progressively revealed as hints. */
export function countHintableLetters(word: string): number {
  return word.replace(/[^a-zA-Z]/g, '').length;
}

/** Reveals the first `revealedCount` letters of `word`, masking the rest with "_". Non-letter characters (spaces, hyphens...) stay visible so multi-word phrases keep their shape. */
export function buildHint(word: string, revealedCount: number): string {
  let shown = 0;
  return word
    .split('')
    .map((ch) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      shown += 1;
      return shown <= revealedCount ? ch : '_';
    })
    .join('');
}
