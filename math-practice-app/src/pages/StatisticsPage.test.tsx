import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import {
  resetPracticeDataStoreForTests,
  saveAttempt,
  saveMistakePattern,
  saveSession,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import type { PracticeAttempt, PracticeSession } from '../types';
import { StatisticsPage } from './StatisticsPage';

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

const session: PracticeSession = {
  id: 'session-stats-1',
  startedAt: '2026-01-15T10:00:00.000Z',
  completedAt: '2026-01-15T10:15:00.000Z',
  operations: ['addition', 'subtraction'],
  difficulty: 2,
  sessionLength: 10,
  attempted: 2,
  correct: 1,
  incorrect: 1,
};

const attempts: PracticeAttempt[] = [
  {
    id: 'attempt-stats-1',
    questionId: 'question-1',
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 2,
    correctAnswer: 4,
    selectedAnswer: 4,
    selfReportedCorrect: true,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-01-15T10:05:00.000Z',
    sessionId: session.id,
  },
  {
    id: 'attempt-stats-2',
    questionId: 'question-2',
    operation: 'subtraction',
    firstOperand: 8,
    secondOperand: 3,
    correctAnswer: 5,
    selectedAnswer: 4,
    selfReportedCorrect: false,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-01-15T10:06:00.000Z',
    sessionId: session.id,
  },
];

function seedStatisticsData() {
  for (const attempt of attempts) {
    saveAttempt(attempt);
  }
  saveSession(session);
}

function renderStatisticsPage() {
  return render(
    <MemoryRouter>
      <AppSettingsProvider>
        <StatisticsPage />
      </AppSettingsProvider>
    </MemoryRouter>,
  );
}

describe('StatisticsPage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('shows an empty state for new users', () => {
    renderStatisticsPage();

    expect(screen.getByText(/no practice questions yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no completed sessions yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset statistics/i }),
    ).toBeDisabled();
  });

  it('displays overall, operation, difficulty, and recent session statistics', () => {
    seedStatisticsData();
    renderStatisticsPage();

    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /by operation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /by difficulty/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/addition, subtraction/i)).toBeInTheDocument();
  });

  it('resets statistics after confirmation', async () => {
    const user = userEvent.setup();
    seedStatisticsData();
    renderStatisticsPage();

    await user.click(screen.getByRole('button', { name: /reset statistics/i }));
    const dialog = screen.getByRole('alertdialog');
    expect(
      within(dialog).getByText(
        /are you sure you want to erase all practice history and statistics/i,
      ),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: /reset statistics/i }),
    );

    expect(screen.getByText(/no practice questions yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset statistics/i }),
    ).toBeDisabled();
  });

  it('displays mistake analytics and details with active and mastered tabs', async () => {
    const user = userEvent.setup();
    saveMistakePattern({
      id: 'pattern-active-1',
      operation: 'multiplication',
      firstOperand: 7,
      secondOperand: 8,
      correctAnswer: 56,
      difficulty: 2,
      incorrectCount: 3,
      similarCorrectCount: 1,
      lastIncorrectAt: '2026-01-15T10:00:00.000Z',
      mastered: false,
    });
    saveMistakePattern({
      id: 'pattern-mastered-1',
      operation: 'addition',
      firstOperand: 9,
      secondOperand: 4,
      correctAnswer: 13,
      difficulty: 1,
      incorrectCount: 2,
      similarCorrectCount: 3,
      lastIncorrectAt: '2026-01-14T10:00:00.000Z',
      mastered: true,
    });

    renderStatisticsPage();

    expect(
      screen.getByRole('heading', { name: /mistake & review analytics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /mistake details & mastery/i }),
    ).toBeInTheDocument();

    // Most missed operation
    expect(screen.getAllByText('Multiplication').length).toBeGreaterThan(0);

    // Facts and Details
    expect(screen.getAllByText('7 × 8 = 56').length).toBeGreaterThan(0);
    expect(screen.getByText(/3 times/i)).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 3 similar correct/i)).toBeInTheDocument();

    // Switch to Mastered tab
    await user.click(screen.getByRole('tab', { name: /mastered/i }));
    expect(screen.getAllByText('9 + 4 = 13').length).toBeGreaterThan(0);
    expect(screen.getByText(/mastered ✓/i)).toBeInTheDocument();
  });
});
