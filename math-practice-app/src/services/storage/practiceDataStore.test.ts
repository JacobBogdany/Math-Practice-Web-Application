import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_APP_SETTINGS } from '../../types/settings';
import type { PracticeAttempt, PracticeSession } from '../../types';
import {
  clearAllApplicationData,
  clearPracticeHistory,
  loadAttempts,
  loadMistakePatterns,
  loadSessions,
  loadSettings,
  recordAttemptMistake,
  recordMistakeReviewResult,
  resetPracticeDataStoreForTests,
  saveAttempt,
  saveSession,
  saveSettings,
} from './practiceDataStore';
import { STORAGE_KEYS } from './storageKeys';
import { setStorageAdapter } from './storageService';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const sampleSession: PracticeSession = {
  id: 'session-1',
  startedAt: '2026-01-01T00:00:00.000Z',
  completedAt: '2026-01-01T00:10:00.000Z',
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
  attempted: 5,
  correct: 4,
  incorrect: 1,
};

const sampleAttempt: PracticeAttempt = {
  id: 'attempt-1',
  questionId: 'question-1',
  operation: 'addition',
  firstOperand: 2,
  secondOperand: 3,
  correctAnswer: 5,
  selectedAnswer: 4,
  selfReportedCorrect: false,
  difficulty: 1,
  source: 'regular',
  attemptedAt: '2026-01-01T00:01:00.000Z',
  sessionId: 'session-1',
};

describe('practiceDataStore', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('loads default settings when none are stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('persists and reloads application settings', () => {
    const customSettings = {
      ...DEFAULT_APP_SETTINGS,
      soundEffectsEnabled: false,
      defaultSessionLength: 5 as const,
    };

    expect(saveSettings(customSettings).success).toBe(true);
    expect(loadSettings()).toEqual(customSettings);
  });

  it('recovers from invalid stored settings', () => {
    const adapter = new MemoryStorage();
    setStorageAdapter(adapter);
    adapter.setItem(STORAGE_KEYS.settings, '{"soundEffectsEnabled":"nope"}');

    expect(loadSettings()).toEqual(DEFAULT_APP_SETTINGS);
  });

  it('persists completed sessions and attempts across reloads', () => {
    expect(saveAttempt(sampleAttempt).success).toBe(true);
    expect(saveSession(sampleSession).success).toBe(true);

    resetPracticeDataStoreForTests();

    expect(loadAttempts()).toEqual([sampleAttempt]);
    expect(loadSessions()).toEqual([sampleSession]);
  });

  it('clears practice history without removing settings', () => {
    const customSettings = {
      ...DEFAULT_APP_SETTINGS,
      soundEffectsEnabled: false,
    };

    saveSettings(customSettings);
    saveAttempt(sampleAttempt);
    saveSession(sampleSession);

    expect(clearPracticeHistory().success).toBe(true);
    resetPracticeDataStoreForTests();

    expect(loadAttempts()).toEqual([]);
    expect(loadSessions()).toEqual([]);
    expect(loadSettings()).toEqual(customSettings);
  });

  it('records and updates mistake patterns', () => {
    const wrongAttempt: PracticeAttempt = {
      ...sampleAttempt,
      selfReportedCorrect: false,
      attemptedAt: '2026-01-01T00:05:00.000Z',
    };

    // First incorrect attempt creates a pattern
    recordAttemptMistake(wrongAttempt);
    let patterns = loadMistakePatterns();
    expect(patterns).toHaveLength(1);
    expect(patterns[0].incorrectCount).toBe(1);
    expect(patterns[0].similarCorrectCount).toBe(0);
    expect(patterns[0].mastered).toBe(false);
    expect(patterns[0].operation).toBe('addition');
    expect(patterns[0].firstOperand).toBe(2);
    expect(patterns[0].secondOperand).toBe(3);

    // Second incorrect attempt increments count without duplicate record
    recordAttemptMistake({
      ...wrongAttempt,
      attemptedAt: '2026-01-01T00:06:00.000Z',
    });
    patterns = loadMistakePatterns();
    expect(patterns).toHaveLength(1);
    expect(patterns[0].incorrectCount).toBe(2);
    expect(patterns[0].lastIncorrectAt).toBe('2026-01-01T00:06:00.000Z');

    // Similar question review success increments similarCorrectCount and reaches mastery
    recordMistakeReviewResult(patterns[0].id, true, 3);
    recordMistakeReviewResult(patterns[0].id, true, 3);
    patterns = loadMistakePatterns();
    expect(patterns[0].similarCorrectCount).toBe(2);
    expect(patterns[0].mastered).toBe(false);

    recordMistakeReviewResult(patterns[0].id, true, 3);
    patterns = loadMistakePatterns();
    expect(patterns[0].similarCorrectCount).toBe(3);
    expect(patterns[0].mastered).toBe(true);

    // Future mistake on mastered pattern unmasters it and resets similar progress
    recordAttemptMistake({
      ...wrongAttempt,
      attemptedAt: '2026-01-02T00:00:00.000Z',
    });
    patterns = loadMistakePatterns();
    expect(patterns[0].mastered).toBe(false);
    expect(patterns[0].incorrectCount).toBe(3);
    expect(patterns[0].similarCorrectCount).toBe(0);

    // Clear all application data clears mistake patterns
    clearAllApplicationData();
    resetPracticeDataStoreForTests();
    expect(loadMistakePatterns()).toHaveLength(0);
  });
});
