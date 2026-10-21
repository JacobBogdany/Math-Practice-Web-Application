import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import {
  loadAttempts,
  loadSessions,
  resetPracticeDataStoreForTests,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import { usePracticeSession } from './usePracticeSession';
import type { PracticeSetupConfig } from '../types/practiceSetup';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

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

const setupConfig: PracticeSetupConfig = {
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
};

function renderPracticeSession(config: PracticeSetupConfig = setupConfig) {
  return renderHook(() => usePracticeSession(config), {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <AppSettingsProvider>{children}</AppSettingsProvider>
      </MemoryRouter>
    ),
  });
}

describe('usePracticeSession', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('initializes an active session with the first question', () => {
    navigate.mockClear();
    const { result } = renderPracticeSession();

    expect(result.current.session.id).toMatch(/^session-/);
    expect(result.current.session.operations).toEqual(['addition']);
    expect(result.current.session.difficulty).toBe(1);
    expect(result.current.session.sessionLength).toBe(5);
    expect(result.current.currentQuestionIndex).toBe(1);
    expect(result.current.isActive).toBe(true);
    expect(result.current.session.attempted).toBe(0);
  });

  it('records attempts and advances to the next question', () => {
    const { result } = renderPracticeSession();
    const firstQuestion = result.current.currentQuestion;

    act(() => {
      result.current.recordResult(
        firstQuestion,
        firstQuestion.correctAnswer,
        true,
      );
    });

    expect(result.current.session.attempted).toBe(1);
    expect(result.current.session.correct).toBe(1);
    expect(result.current.attempts).toHaveLength(1);
    expect(result.current.currentQuestionIndex).toBe(2);
    expect(result.current.currentQuestion.id).not.toBe(firstQuestion.id);
  });

  it('completes a fixed-length session after the final attempt', async () => {
    navigate.mockClear();
    const shortConfig: PracticeSetupConfig = {
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
    };
    const { result } = renderPracticeSession(shortConfig);

    for (let index = 0; index < 5; index += 1) {
      act(() => {
        const question = result.current.currentQuestion;
        result.current.recordResult(
          question,
          question.correctAnswer,
          index % 2 === 0,
        );
      });
    }

    expect(result.current.session.attempted).toBe(5);
    expect(result.current.session.correct).toBe(3);
    expect(result.current.session.incorrect).toBe(2);
    expect(result.current.isActive).toBe(false);
    expect(result.current.session.completedAt).toBeTruthy();

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/practice/summary', {
        replace: true,
        state: {
          session: expect.objectContaining({
            attempted: 5,
            completedAt: expect.any(String),
          }),
          attempts: expect.any(Array),
        },
      });
    });

    resetPracticeDataStoreForTests();
    expect(loadAttempts()).toHaveLength(5);
    expect(loadSessions()).toHaveLength(1);
  });
});
