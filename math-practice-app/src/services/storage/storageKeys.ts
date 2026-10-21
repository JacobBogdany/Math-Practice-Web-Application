export const STORAGE_KEYS = {
  version: 'mathPractice.version',
  settings: 'mathPractice.settings',
  sessions: 'mathPractice.sessions',
  attempts: 'mathPractice.attempts',
  mistakePatterns: 'mathPractice.mistakePatterns',
  statistics: 'mathPractice.statistics',
} as const;

export const MAX_STORED_SESSIONS = 100;
export const MAX_STORED_ATTEMPTS = 5000;

