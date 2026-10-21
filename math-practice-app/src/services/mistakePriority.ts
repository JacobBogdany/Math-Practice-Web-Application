import type { MistakePattern } from '../types';

export function getActiveMistakePatterns(
  patterns: MistakePattern[],
): MistakePattern[] {
  return patterns.filter((p) => !p.mastered);
}

export function getMasteredMistakePatterns(
  patterns: MistakePattern[],
): MistakePattern[] {
  return patterns.filter((p) => p.mastered);
}

export function computeMistakePriorityScore(
  pattern: MistakePattern,
  referenceTimeMs = Date.now(),
): number {
  const incorrectWeight = pattern.incorrectCount * 10;
  const reviewProgressDeduction = pattern.similarCorrectCount * 4;

  const lastIncorrectMs = new Date(pattern.lastIncorrectAt).getTime();
  const hoursSinceMistake = Math.max(
    0,
    (referenceTimeMs - lastIncorrectMs) / (1000 * 60 * 60),
  );

  // Recency bonus: mistakes in the last 48 hours get extra priority
  const recencyBonus = Math.max(0, 48 - hoursSinceMistake) * 0.25;

  return incorrectWeight - reviewProgressDeduction + recencyBonus;
}

export function prioritizeMistakePatterns(
  patterns: MistakePattern[],
  referenceTimeMs = Date.now(),
): MistakePattern[] {
  // Sort by priority score descending; randomize ties
  return [...patterns]
    .map((pattern) => ({
      pattern,
      score: computeMistakePriorityScore(pattern, referenceTimeMs),
      tieBreaker: Math.random(),
    }))
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (Math.abs(diff) > 0.001) {
        return diff;
      }
      return b.tieBreaker - a.tieBreaker;
    })
    .map((item) => item.pattern);
}
