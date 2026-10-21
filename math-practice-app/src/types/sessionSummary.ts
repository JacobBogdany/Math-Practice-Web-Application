import type { PracticeAttempt, PracticeSession } from '../types';
import type { PracticeSetupConfig } from './practiceSetup';

export interface SessionSummaryState {
  session: PracticeSession;
  attempts: PracticeAttempt[];
}

export function isValidSessionSummaryState(
  value: unknown,
): value is SessionSummaryState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as SessionSummaryState;

  return (
    typeof state.session === 'object' &&
    state.session !== null &&
    typeof state.session.id === 'string' &&
    Array.isArray(state.attempts)
  );
}

export function calculateAccuracy(correct: number, attempted: number): number {
  if (attempted === 0) {
    return 0;
  }

  return Math.round((correct / attempted) * 100);
}

export function countMistakeReviewAttempts(
  attempts: PracticeAttempt[],
): number {
  return attempts.filter((attempt) => attempt.source === 'mistake-review')
    .length;
}

export function sessionToPracticeSetup(
  session: PracticeSession,
): PracticeSetupConfig {
  return {
    operations: session.operations,
    difficulty: session.difficulty,
    sessionLength: session.sessionLength,
  };
}
