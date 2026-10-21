import { describe, expect, it } from 'vitest';
import type { PracticeAttempt, PracticeSession } from '../types';
import {
  calculateAccuracy,
  countMistakeReviewAttempts,
  sessionToPracticeSetup,
} from './sessionSummary';

const session: PracticeSession = {
  id: 'session-1',
  startedAt: '2026-01-01T00:00:00.000Z',
  operations: ['addition', 'multiplication'],
  difficulty: 2,
  sessionLength: 10,
  attempted: 8,
  correct: 6,
  incorrect: 2,
};

const attempts: PracticeAttempt[] = [
  {
    id: 'attempt-1',
    questionId: 'question-1',
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 3,
    correctAnswer: 5,
    selectedAnswer: 5,
    selfReportedCorrect: true,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-01-01T00:01:00.000Z',
    sessionId: 'session-1',
  },
  {
    id: 'attempt-2',
    questionId: 'question-2',
    operation: 'multiplication',
    firstOperand: 3,
    secondOperand: 4,
    correctAnswer: 12,
    selectedAnswer: 10,
    selfReportedCorrect: false,
    difficulty: 2,
    source: 'mistake-review',
    attemptedAt: '2026-01-01T00:02:00.000Z',
    sessionId: 'session-1',
  },
];

describe('sessionSummary helpers', () => {
  it('calculates accuracy as a rounded percentage', () => {
    expect(calculateAccuracy(6, 8)).toBe(75);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('counts mistake-review attempts', () => {
    expect(countMistakeReviewAttempts(attempts)).toBe(1);
  });

  it('converts a completed session back into practice setup config', () => {
    expect(sessionToPracticeSetup(session)).toEqual({
      operations: ['addition', 'multiplication'],
      difficulty: 2,
      sessionLength: 10,
    });
  });
});

