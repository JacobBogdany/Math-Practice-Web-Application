import type { AppSettings } from '../../types/settings';
import { DEFAULT_APP_SETTINGS } from '../../types/settings';
import type { DifficultyLevel, MathOperation } from '../../types/question';
import type {
  PracticeAttempt,
  PracticeSession,
  SessionLength,
} from '../../types/session';
import type { MistakePattern } from '../../types/mistake';

const ALL_OPERATIONS: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

const SESSION_LENGTHS: SessionLength[] = [5, 10, 20, 'continuous'];

function isMathOperation(value: unknown): value is MathOperation {
  return (
    typeof value === 'string' && ALL_OPERATIONS.includes(value as MathOperation)
  );
}

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === 'number' && [1, 2, 3, 4].includes(value);
}

function isSessionLength(value: unknown): value is SessionLength {
  return (
    (typeof value === 'number' &&
      SESSION_LENGTHS.includes(value as SessionLength)) ||
    value === 'continuous'
  );
}

export function isValidAppSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const settings = value as AppSettings;

  return (
    typeof settings.soundEffectsEnabled === 'boolean' &&
    typeof settings.cardAnimationEnabled === 'boolean' &&
    typeof settings.showExplanations === 'boolean' &&
    isSessionLength(settings.defaultSessionLength) &&
    isDifficultyLevel(settings.defaultDifficulty) &&
    Array.isArray(settings.defaultOperations) &&
    settings.defaultOperations.length > 0 &&
    settings.defaultOperations.every(isMathOperation) &&
    typeof settings.masteryThreshold === 'number' &&
    settings.masteryThreshold > 0
  );
}

export function sanitizeAppSettings(value: unknown): AppSettings {
  if (isValidAppSettings(value)) {
    return { ...DEFAULT_APP_SETTINGS, ...value };
  }

  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APP_SETTINGS };
  }

  const partial = value as Partial<AppSettings>;
  const merged: AppSettings = { ...DEFAULT_APP_SETTINGS };

  if (typeof partial.soundEffectsEnabled === 'boolean') {
    merged.soundEffectsEnabled = partial.soundEffectsEnabled;
  }
  if (typeof partial.cardAnimationEnabled === 'boolean') {
    merged.cardAnimationEnabled = partial.cardAnimationEnabled;
  }
  if (typeof partial.showExplanations === 'boolean') {
    merged.showExplanations = partial.showExplanations;
  }
  if (isSessionLength(partial.defaultSessionLength)) {
    merged.defaultSessionLength = partial.defaultSessionLength;
  }
  if (isDifficultyLevel(partial.defaultDifficulty)) {
    merged.defaultDifficulty = partial.defaultDifficulty;
  }
  if (
    Array.isArray(partial.defaultOperations) &&
    partial.defaultOperations.length > 0 &&
    partial.defaultOperations.every(isMathOperation)
  ) {
    merged.defaultOperations = partial.defaultOperations;
  }
  if (
    typeof partial.masteryThreshold === 'number' &&
    partial.masteryThreshold > 0
  ) {
    merged.masteryThreshold = partial.masteryThreshold;
  }

  return merged;
}

export function isValidPracticeSession(
  value: unknown,
): value is PracticeSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as PracticeSession;

  return (
    typeof session.id === 'string' &&
    typeof session.startedAt === 'string' &&
    (session.completedAt === undefined ||
      typeof session.completedAt === 'string') &&
    Array.isArray(session.operations) &&
    session.operations.every(isMathOperation) &&
    isDifficultyLevel(session.difficulty) &&
    isSessionLength(session.sessionLength) &&
    typeof session.attempted === 'number' &&
    typeof session.correct === 'number' &&
    typeof session.incorrect === 'number' &&
    (session.mode === undefined ||
      session.mode === 'regular' ||
      session.mode === 'mistake-review')
  );
}

export function isValidPracticeAttempt(
  value: unknown,
): value is PracticeAttempt {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const attempt = value as PracticeAttempt;

  return (
    typeof attempt.id === 'string' &&
    typeof attempt.questionId === 'string' &&
    isMathOperation(attempt.operation) &&
    typeof attempt.firstOperand === 'number' &&
    typeof attempt.secondOperand === 'number' &&
    typeof attempt.correctAnswer === 'number' &&
    typeof attempt.selectedAnswer === 'number' &&
    typeof attempt.selfReportedCorrect === 'boolean' &&
    isDifficultyLevel(attempt.difficulty) &&
    (attempt.source === 'regular' || attempt.source === 'mistake-review') &&
    (attempt.mistakePatternId === undefined ||
      typeof attempt.mistakePatternId === 'string') &&
    typeof attempt.attemptedAt === 'string' &&
    typeof attempt.sessionId === 'string'
  );
}

export function sanitizePracticeSessions(value: unknown): PracticeSession[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidPracticeSession);
}

export function sanitizePracticeAttempts(value: unknown): PracticeAttempt[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidPracticeAttempt);
}

export function isValidMistakePattern(value: unknown): value is MistakePattern {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const pattern = value as MistakePattern;

  return (
    typeof pattern.id === 'string' &&
    isMathOperation(pattern.operation) &&
    typeof pattern.firstOperand === 'number' &&
    typeof pattern.secondOperand === 'number' &&
    typeof pattern.correctAnswer === 'number' &&
    isDifficultyLevel(pattern.difficulty) &&
    typeof pattern.incorrectCount === 'number' &&
    pattern.incorrectCount >= 0 &&
    typeof pattern.similarCorrectCount === 'number' &&
    pattern.similarCorrectCount >= 0 &&
    typeof pattern.lastIncorrectAt === 'string' &&
    typeof pattern.mastered === 'boolean'
  );
}

export function sanitizeMistakePatterns(value: unknown): MistakePattern[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidMistakePattern);
}
