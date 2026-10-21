import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import {
  resetPracticeDataStoreForTests,
  saveActivePracticeSession,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import { PracticePage } from './PracticePage';

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

describe('PracticePage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('restores active session from storage when location state is absent', () => {
    saveActivePracticeSession({
      config: {
        operations: ['addition'],
        difficulty: 1,
        sessionLength: 5,
        mode: 'regular',
      },
      session: {
        id: 'session-saved-1',
        startedAt: new Date().toISOString(),
        operations: ['addition'],
        difficulty: 1,
        sessionLength: 5,
        attempted: 2,
        correct: 2,
        incorrect: 0,
        mode: 'regular',
      },
      currentQuestion: {
        id: 'q-restored-3',
        operation: 'addition',
        difficulty: 1,
        firstOperand: 4,
        secondOperand: 5,
        displayText: '4 + 5 = ?',
        correctAnswer: 9,
        choices: [7, 8, 9, 10],
        source: 'regular',
      },
      currentQuestionIndex: 3,
      attempts: [],
      recentQuestionSignatures: ['addition:4+5'],
    });

    render(
      <MemoryRouter initialEntries={['/practice/session']}>
        <AppSettingsProvider>
          <Routes>
            <Route path="/practice/session" element={<PracticePage />} />
            <Route path="/practice/setup" element={<div>Setup Page</div>} />
          </Routes>
        </AppSettingsProvider>
      </MemoryRouter>,
    );

    // Displays restored question number
    expect(
      screen.getAllByText(/question 3 of 5/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4 + 5 = ?')).toBeInTheDocument();
  });

  it('shows end session confirmation dialog and allows canceling', async () => {
    const user = userEvent.setup();
    const config = {
      operations: ['addition'] as const,
      difficulty: 1 as const,
      sessionLength: 5 as const,
    };

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/practice/session', state: config }]}
      >
        <AppSettingsProvider>
          <Routes>
            <Route path="/practice/session" element={<PracticePage />} />
          </Routes>
        </AppSettingsProvider>
      </MemoryRouter>,
    );

    const endButton = screen.getByRole('button', { name: /end session/i });
    await user.click(endButton);

    expect(screen.getByText(/end practice session\?/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', {
      name: /keep practicing/i,
    });
    await user.click(cancelButton);

    expect(
      screen.queryByText(/end practice session\?/i),
    ).not.toBeInTheDocument();
  });
});
