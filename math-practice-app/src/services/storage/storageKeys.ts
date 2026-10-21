export const STORAGE_KEYS = {
  version: 'mathPractice.version',
  settings: 'mathPractice.settings',
  sessions: 'mathPractice.sessions',
  attempts: 'mathPractice.attempts',
  mistakePatterns: 'mathPractice.mistakePatterns',
  statistics: 'mathPractice.statistics',
  activeSession: 'mathPractice.activeSession',
} as const;

export const MAX_STORED_SESSIONS = 100;
export const MAX_STORED_ATTEMPTS = 5000;
