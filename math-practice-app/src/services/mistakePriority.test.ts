import { describe, expect, it } from 'vitest';
import type { MistakePattern } from '../types';
import {
  computeMistakePriorityScore,
  getActiveMistakePatterns,
  getMasteredMistakePatterns,
  prioritizeMistakePatterns,
} from './mistakePriority';

describe('mistakePriority', () => {
  const baseTime = 1767225600000; // 2026-01-01T00:00:00Z
  const oneHourAgo = new Date(baseTime - 3600 * 1000).toISOString();
  const threeDaysAgo = new Date(baseTime - 72 * 3600 * 1000).toISOString();

  const patternA: MistakePattern = {
    id: 'pattern-A',
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 3,
    correctAnswer: 5,
    difficulty: 1,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: threeDaysAgo,
    mastered: false,
  };

  const patternB: MistakePattern = {
    id: 'pattern-B',
    operation: 'multiplication',
    firstOperand: 8,
    secondOperand: 7,
    correctAnswer: 56,
    difficulty: 2,
    incorrectCount: 5, // Frequently missed
    similarCorrectCount: 0,
    lastIncorrectAt: threeDaysAgo,
    mastered: false,
  };

  const patternC: MistakePattern = {
    id: 'pattern-C',
    operation: 'subtraction',
    firstOperand: 10,
    secondOperand: 4,
    correctAnswer: 6,
    difficulty: 1,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: oneHourAgo, // Recently missed
    mastered: false,
  };

  const patternD: MistakePattern = {
    id: 'pattern-D',
    operation: 'division',
    firstOperand: 12,
    secondOperand: 3,
    correctAnswer: 4,
    difficulty: 1,
    incorrectCount: 1,
    similarCorrectCount: 2, // Substantial review progress
    lastIncorrectAt: threeDaysAgo,
    mastered: false,
  };

  const patternMastered: MistakePattern = {
    id: 'pattern-mastered',
    operation: 'multiplication',
    firstOperand: 5,
    secondOperand: 5,
    correctAnswer: 25,
    difficulty: 1,
    incorrectCount: 1,
    similarCorrectCount: 3,
    lastIncorrectAt: threeDaysAgo,
    mastered: true,
  };

  it('filters active and mastered patterns', () => {
    const list = [patternA, patternMastered];
    expect(getActiveMistakePatterns(list)).toEqual([patternA]);
    expect(getMasteredMistakePatterns(list)).toEqual([patternMastered]);
  });

  it('scores frequently missed patterns higher than rarely missed ones', () => {
    const scoreB = computeMistakePriorityScore(patternB, baseTime);
    const scoreA = computeMistakePriorityScore(patternA, baseTime);
    expect(scoreB).toBeGreaterThan(scoreA);
  });

  it('scores recently missed patterns higher than older ones', () => {
    const scoreC = computeMistakePriorityScore(patternC, baseTime);
    const scoreA = computeMistakePriorityScore(patternA, baseTime);
    expect(scoreC).toBeGreaterThan(scoreA);
  });

  it('scores patterns with more review progress lower', () => {
    const scoreA = computeMistakePriorityScore(patternA, baseTime);
    const scoreD = computeMistakePriorityScore(patternD, baseTime);
    expect(scoreA).toBeGreaterThan(scoreD);
  });

  it('sorts patterns by priority correctly', () => {
    const sorted = prioritizeMistakePatterns(
      [patternA, patternB, patternC, patternD],
      baseTime,
    );

    // patternB (frequently missed: 5 incorrect) should rank highest
    expect(sorted[0].id).toBe('pattern-B');
    // patternD (has 2 review successes) should rank lowest among unmastered
    expect(sorted[3].id).toBe('pattern-D');
  });
});
