import { describe, expect, it } from 'vitest';
import type { PracticeAttempt } from '../types';
import {
  calculateAppStatistics,
  calculateOperationAccuracy,
  calculateOverallAccuracy,
} from './statisticsService';

const attempts: PracticeAttempt[] = [
  {
    id: 'attempt-1',
    questionId: 'question-1',
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 2,
    correctAnswer: 4,
    selectedAnswer: 4,
    selfReportedCorrect: true,
    difficulty: 1,
    source: 'regular',
    attemptedAt: '2026-01-01T00:01:00.000Z',
    sessionId: 'session-1',
  },
  {
    id: 'attempt-2',
    questionId: 'question-2',
    operation: 'subtraction',
    firstOperand: 8,
    secondOperand: 3,
    correctAnswer: 5,
    selectedAnswer: 4,
    selfReportedCorrect: false,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-01-01T00:02:00.000Z',
    sessionId: 'session-1',
  },
  {
    id: 'attempt-3',
    questionId: 'question-3',
    operation: 'multiplication',
    firstOperand: 3,
    secondOperand: 4,
    correctAnswer: 12,
    selectedAnswer: 12,
    selfReportedCorrect: true,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-01-01T00:03:00.000Z',
    sessionId: 'session-1',
  },
];

describe('statisticsService', () => {
  it('calculates overall totals and accuracy', () => {
    const statistics = calculateAppStatistics(attempts);

    expect(statistics.attempted).toBe(3);
    expect(statistics.correct).toBe(2);
    expect(statistics.incorrect).toBe(1);
    expect(calculateOverallAccuracy(statistics)).toBe(67);
  });

  it('returns zero accuracy when no attempts exist', () => {
    const statistics = calculateAppStatistics([]);

    expect(statistics.attempted).toBe(0);
    expect(calculateOverallAccuracy(statistics)).toBe(0);
    expect(calculateOperationAccuracy(statistics.byOperation.addition)).toBe(0);
  });

  it('tracks statistics by operation', () => {
    const statistics = calculateAppStatistics(attempts);

    expect(statistics.byOperation.addition).toEqual({
      attempted: 1,
      correct: 1,
      incorrect: 0,
    });
    expect(statistics.byOperation.subtraction).toEqual({
      attempted: 1,
      correct: 0,
      incorrect: 1,
    });
    expect(
      calculateOperationAccuracy(statistics.byOperation.multiplication),
    ).toBe(100);
  });

  it('tracks statistics by difficulty', () => {
    const statistics = calculateAppStatistics(attempts);

    expect(statistics.byDifficulty[1]).toEqual({
      attempted: 1,
      correct: 1,
      incorrect: 0,
    });
    expect(statistics.byDifficulty[2]).toEqual({
      attempted: 2,
      correct: 1,
      incorrect: 1,
    });
    expect(calculateOperationAccuracy(statistics.byDifficulty[2])).toBe(50);
  });
});

