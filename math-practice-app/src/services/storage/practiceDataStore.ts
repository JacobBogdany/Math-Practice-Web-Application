import type { AppSettings } from '../../types/settings';
import { DEFAULT_APP_SETTINGS } from '../../types/settings';
import type { PracticeAttempt, PracticeSession } from '../../types';
import { runStorageMigrations } from './migrations';
import {
  MAX_STORED_ATTEMPTS,
  MAX_STORED_SESSIONS,
  STORAGE_KEYS,
} from './storageKeys';
import {
  readJsonItem,
  type StorageWriteResult,
  writeJsonItem,
} from './storageService';
import {
  sanitizeAppSettings,
  sanitizePracticeAttempts,
  sanitizePracticeSessions,
} from './validators';

let migrationsInitialized = false;
let memorySettings: AppSettings | null = null;
let memorySessions: PracticeSession[] = [];
let memoryAttempts: PracticeAttempt[] = [];

function ensureMigrations(): void {
  if (migrationsInitialized) {
    return;
  }

  runStorageMigrations();
  migrationsInitialized = true;
}

function trimSessions(sessions: PracticeSession[]): PracticeSession[] {
  return sessions
    .slice()
    .sort((left, right) => {
      const leftTime = left.completedAt ?? left.startedAt;
      const rightTime = right.completedAt ?? right.startedAt;
      return rightTime.localeCompare(leftTime);
    })
    .slice(0, MAX_STORED_SESSIONS);
}

function trimAttempts(attempts: PracticeAttempt[]): PracticeAttempt[] {
  return attempts
    .slice()
    .sort((left, right) => right.attemptedAt.localeCompare(left.attemptedAt))
    .slice(0, MAX_STORED_ATTEMPTS);
}

export function loadSettings(): AppSettings {
  ensureMigrations();

  if (memorySettings) {
    return { ...memorySettings };
  }

  const result = readJsonItem<AppSettings>(STORAGE_KEYS.settings);

  if (!result.success || result.error === 'parse') {
    return { ...DEFAULT_APP_SETTINGS };
  }

  return sanitizeAppSettings(result.data);
}

export function saveSettings(settings: AppSettings): StorageWriteResult {
  ensureMigrations();
  const sanitized = sanitizeAppSettings(settings);
  memorySettings = sanitized;

  return writeJsonItem(STORAGE_KEYS.settings, sanitized);
}

export function loadSessions(): PracticeSession[] {
  ensureMigrations();

  if (memorySessions.length > 0) {
    return [...memorySessions];
  }

  const result = readJsonItem<PracticeSession[]>(STORAGE_KEYS.sessions);

  if (!result.success || result.error === 'parse') {
    return [];
  }

  return sanitizePracticeSessions(result.data);
}

export function saveSession(session: PracticeSession): StorageWriteResult {
  ensureMigrations();

  const sessions = loadSessions().filter((stored) => stored.id !== session.id);
  sessions.push(session);
  const trimmed = trimSessions(sessions);
  memorySessions = trimmed;

  return writeJsonItem(STORAGE_KEYS.sessions, trimmed);
}

export function loadAttempts(): PracticeAttempt[] {
  ensureMigrations();

  if (memoryAttempts.length > 0) {
    return [...memoryAttempts];
  }

  const result = readJsonItem<PracticeAttempt[]>(STORAGE_KEYS.attempts);

  if (!result.success || result.error === 'parse') {
    return [];
  }

  return sanitizePracticeAttempts(result.data);
}

export function saveAttempt(attempt: PracticeAttempt): StorageWriteResult {
  ensureMigrations();

  const attempts = loadAttempts();
  const existingIndex = attempts.findIndex((stored) => stored.id === attempt.id);

  if (existingIndex >= 0) {
    attempts[existingIndex] = attempt;
  } else {
    attempts.push(attempt);
  }

  const trimmed = trimAttempts(attempts);
  memoryAttempts = trimmed;

  return writeJsonItem(STORAGE_KEYS.attempts, trimmed);
}

export function saveSessionAttempts(
  session: PracticeSession,
  attempts: PracticeAttempt[],
): StorageWriteResult {
  let lastResult: StorageWriteResult = { success: true };

  for (const attempt of attempts) {
    lastResult = saveAttempt(attempt);

    if (!lastResult.success) {
      return lastResult;
    }
  }

  return saveSession(session);
}

export function clearPracticeHistory(): StorageWriteResult {
  ensureMigrations();

  memorySessions = [];
  memoryAttempts = [];

  const sessionsResult = writeJsonItem(STORAGE_KEYS.sessions, []);
  if (!sessionsResult.success) {
    return sessionsResult;
  }

  const attemptsResult = writeJsonItem(STORAGE_KEYS.attempts, []);
  if (!attemptsResult.success) {
    return attemptsResult;
  }

  return writeJsonItem(STORAGE_KEYS.statistics, null);
}

export function clearAllApplicationData(): StorageWriteResult {
  ensureMigrations();

  memorySessions = [];
  memoryAttempts = [];
  memorySettings = { ...DEFAULT_APP_SETTINGS };

  const writeResults: StorageWriteResult[] = [
    writeJsonItem(STORAGE_KEYS.settings, DEFAULT_APP_SETTINGS),
    writeJsonItem(STORAGE_KEYS.sessions, []),
    writeJsonItem(STORAGE_KEYS.attempts, []),
    writeJsonItem(STORAGE_KEYS.mistakePatterns, []),
    writeJsonItem(STORAGE_KEYS.statistics, null),
  ];

  const failedResult = writeResults.find((result) => !result.success);
  return failedResult ?? { success: true };
}

export function resetPracticeDataStoreForTests(): void {
  migrationsInitialized = false;
  memorySettings = null;
  memorySessions = [];
  memoryAttempts = [];
}
