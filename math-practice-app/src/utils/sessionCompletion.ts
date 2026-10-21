import type { PracticeSession } from '../types';

export function isFixedSessionComplete(session: PracticeSession): boolean {
  return (
    session.sessionLength !== 'continuous' &&
    session.attempted >= session.sessionLength
  );
}

