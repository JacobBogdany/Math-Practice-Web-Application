import { describe, expect, it } from 'vitest';
import { isFixedSessionComplete } from './sessionCompletion';
import type { PracticeSession } from '../types';

function createSession(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    id: 'session-test',
    startedAt: '2026-01-01T00:00:00.000Z',
    operations: ['addition'],
    difficulty: 1,
    sessionLength: 5,
    attempted: 0,
    correct: 0,
    incorrect: 0,
    ...overrides,
  };
}

describe('isFixedSessionComplete', () => {
  it('returns false before the fixed session length is reached', () => {
    expect(isFixedSessionComplete(createSession({ attempted: 4 }))).toBe(false);
  });

  it('returns true when attempted questions meet the session length', () => {
    expect(
      isFixedSessionComplete(createSession({ attempted: 5, sessionLength: 5 })),
    ).toBe(true);
  });

  it('returns false for continuous practice regardless of attempts', () => {
    expect(
      isFixedSessionComplete(
        createSession({ sessionLength: 'continuous', attempted: 20 }),
      ),
    ).toBe(false);
  });
});
