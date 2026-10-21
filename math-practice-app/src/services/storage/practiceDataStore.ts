import type { AppSettings } from '../../types/settings';
import { DEFAULT_APP_SETTINGS } from '../../types/settings';
import type {
  DifficultyLevel,
  MathOperation,
  MistakePattern,
  PracticeAttempt,
  PracticeSession,
  Question,
} from '../../types';
import type { PracticeSetupConfig } from '../../types/practiceSetup';
import { isValidPracticeSetupConfig } from '../../types/practiceSetup';
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
  sanitizeMistakePatterns,
  sanitizePracticeAttempts,
  sanitizePracticeSessions,
} from './validators';

let migrationsInitialized = false;
let memorySettings: AppSettings | null = null;
let memorySessions: PracticeSession[] = [];
let memoryAttempts: PracticeAttempt[] = [];
let memoryMistakePatterns: MistakePattern[] | null = null;

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
  const existingIndex = attempts.findIndex(
    (stored) => stored.id === attempt.id,
  );

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
  for (const attempt of attempts) {
    const attemptResult = saveAttempt(attempt);

    if (!attemptResult.success) {
      return attemptResult;
    }
  }

  return saveSession(session);
}

export function createMistakePatternId(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel,
): string {
  return `mistake-${operation}-${firstOperand}-${secondOperand}-${difficulty}`;
}

export function loadMistakePatterns(): MistakePattern[] {
  ensureMigrations();

  if (memoryMistakePatterns) {
    return memoryMistakePatterns.map((pattern) => ({ ...pattern }));
  }

  const result = readJsonItem<unknown>(STORAGE_KEYS.mistakePatterns);

  if (!result.success || !result.data) {
    memoryMistakePatterns = [];
    return [];
  }

  const patterns = sanitizeMistakePatterns(result.data);
  memoryMistakePatterns = patterns;
  return patterns.map((pattern) => ({ ...pattern }));
}

export function saveMistakePatterns(
  patterns: MistakePattern[],
): StorageWriteResult {
  ensureMigrations();
  memoryMistakePatterns = patterns.map((pattern) => ({ ...pattern }));
  return writeJsonItem(STORAGE_KEYS.mistakePatterns, patterns);
}

export function saveMistakePattern(
  pattern: MistakePattern,
): StorageWriteResult {
  const patterns = loadMistakePatterns();
  const existingIndex = patterns.findIndex((p) => p.id === pattern.id);

  if (existingIndex >= 0) {
    patterns[existingIndex] = { ...pattern };
  } else {
    patterns.push({ ...pattern });
  }

  return saveMistakePatterns(patterns);
}

export function recordAttemptMistake(
  attempt: PracticeAttempt,
): StorageWriteResult {
  const patterns = loadMistakePatterns();
  const patternId = createMistakePatternId(
    attempt.operation,
    attempt.firstOperand,
    attempt.secondOperand,
    attempt.difficulty,
  );
  const existingIndex = patterns.findIndex(
    (p) =>
      p.id === patternId ||
      (p.operation === attempt.operation &&
        p.firstOperand === attempt.firstOperand &&
        p.secondOperand === attempt.secondOperand &&
        p.difficulty === attempt.difficulty),
  );

  if (existingIndex >= 0) {
    const existing = patterns[existingIndex];
    patterns[existingIndex] = {
      ...existing,
      incorrectCount: existing.incorrectCount + 1,
      lastIncorrectAt: attempt.attemptedAt,
      similarCorrectCount: 0,
      mastered: false,
    };
  } else {
    patterns.push({
      id: patternId,
      operation: attempt.operation,
      firstOperand: attempt.firstOperand,
      secondOperand: attempt.secondOperand,
      correctAnswer: attempt.correctAnswer,
      difficulty: attempt.difficulty,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: attempt.attemptedAt,
      mastered: false,
    });
  }

  return saveMistakePatterns(patterns);
}

export function recordMistakeReviewResult(
  patternId: string,
  selfReportedCorrect: boolean,
  masteryThreshold = 3,
): StorageWriteResult {
  const patterns = loadMistakePatterns();
  const existingIndex = patterns.findIndex((p) => p.id === patternId);

  if (existingIndex < 0) {
    return { success: true };
  }

  const existing = patterns[existingIndex];

  if (selfReportedCorrect) {
    const nextCount = existing.similarCorrectCount + 1;
    patterns[existingIndex] = {
      ...existing,
      similarCorrectCount: nextCount,
      mastered: nextCount >= masteryThreshold,
    };
  } else {
    patterns[existingIndex] = {
      ...existing,
      incorrectCount: existing.incorrectCount + 1,
      similarCorrectCount: 0,
      lastIncorrectAt: new Date().toISOString(),
      mastered: false,
    };
  }

  return saveMistakePatterns(patterns);
}

export interface ActivePracticeSessionData {
  config: PracticeSetupConfig;
  session: PracticeSession;
  currentQuestion: Question;
  currentQuestionIndex: number;
  attempts: PracticeAttempt[];
  recentQuestionSignatures: string[];
}

export function saveActivePracticeSession(
  data: ActivePracticeSessionData,
): StorageWriteResult {
  ensureMigrations();
  return writeJsonItem(STORAGE_KEYS.activeSession, data);
}

export function loadActivePracticeSession(): ActivePracticeSessionData | null {
  ensureMigrations();
  const result = readJsonItem<ActivePracticeSessionData>(
    STORAGE_KEYS.activeSession,
  );

  if (!result.success || !result.data || typeof result.data !== 'object') {
    return null;
  }

  const { data } = result;
  if (
    !isValidPracticeSetupConfig(data.config) ||
    !data.session ||
    typeof data.session.id !== 'string' ||
    !data.currentQuestion ||
    typeof data.currentQuestion.id !== 'string' ||
    typeof data.currentQuestionIndex !== 'number'
  ) {
    return null;
  }

  return data;
}

export function clearActivePracticeSession(): StorageWriteResult {
  ensureMigrations();
  return writeJsonItem(STORAGE_KEYS.activeSession, null);
}

export function clearMistakePatterns(): StorageWriteResult {
  ensureMigrations();
  memoryMistakePatterns = [];
  return writeJsonItem(STORAGE_KEYS.mistakePatterns, []);
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
  memoryMistakePatterns = [];
  memorySettings = { ...DEFAULT_APP_SETTINGS };

  const writeResults: StorageWriteResult[] = [
    writeJsonItem(STORAGE_KEYS.settings, DEFAULT_APP_SETTINGS),
    writeJsonItem(STORAGE_KEYS.sessions, []),
    writeJsonItem(STORAGE_KEYS.attempts, []),
    writeJsonItem(STORAGE_KEYS.mistakePatterns, []),
    writeJsonItem(STORAGE_KEYS.activeSession, null),
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
  memoryMistakePatterns = null;
}
