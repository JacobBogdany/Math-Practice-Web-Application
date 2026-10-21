import { describe, expect, it } from 'vitest';
import { DEFAULT_APP_SETTINGS } from '../../types/settings';
import {
  isValidAppSettings,
  isValidMistakePattern,
  isValidPracticeAttempt,
  isValidPracticeSession,
  sanitizeAppSettings,
  sanitizeMistakePatterns,
  sanitizePracticeAttempts,
  sanitizePracticeSessions,
} from './validators';

describe('storage validators', () => {
  it('validates application settings', () => {
    expect(isValidAppSettings(DEFAULT_APP_SETTINGS)).toBe(true);
    expect(
      isValidAppSettings({ ...DEFAULT_APP_SETTINGS, defaultOperations: [] }),
    ).toBe(false);
  });

  it('sanitizes invalid settings to defaults', () => {
    expect(sanitizeAppSettings(null)).toEqual(DEFAULT_APP_SETTINGS);
    expect(sanitizeAppSettings({ cardAnimationEnabled: false })).toEqual({
      ...DEFAULT_APP_SETTINGS,
      cardAnimationEnabled: false,
    });
  });

  it('filters invalid sessions from stored arrays', () => {
    const sessions = sanitizePracticeSessions([
      {
        id: 'session-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        operations: ['addition'],
        difficulty: 1,
        sessionLength: 5,
        attempted: 5,
        correct: 4,
        incorrect: 1,
      },
      { id: 'broken' },
    ]);

    expect(sessions).toHaveLength(1);
    expect(isValidPracticeSession(sessions[0])).toBe(true);
  });

  it('filters invalid attempts from stored arrays', () => {
    const attempts = sanitizePracticeAttempts([
      {
        id: 'attempt-1',
        questionId: 'question-1',
        operation: 'addition',
        firstOperand: 1,
        secondOperand: 2,
        correctAnswer: 3,
        selectedAnswer: 3,
        selfReportedCorrect: true,
        difficulty: 1,
        source: 'regular',
        attemptedAt: '2026-01-01T00:00:00.000Z',
        sessionId: 'session-1',
      },
      { id: 'broken' },
    ]);

    expect(attempts).toHaveLength(1);
    expect(isValidPracticeAttempt(attempts[0])).toBe(true);
  });

  it('filters invalid mistake patterns from stored arrays', () => {
    const patterns = sanitizeMistakePatterns([
      {
        id: 'pattern-1',
        operation: 'multiplication',
        firstOperand: 7,
        secondOperand: 8,
        correctAnswer: 56,
        difficulty: 2,
        incorrectCount: 2,
        similarCorrectCount: 1,
        lastIncorrectAt: '2026-01-01T00:00:00.000Z',
        mastered: false,
      },
      { id: 'broken' },
    ]);

    expect(patterns).toHaveLength(1);
    expect(isValidMistakePattern(patterns[0])).toBe(true);
  });
});
