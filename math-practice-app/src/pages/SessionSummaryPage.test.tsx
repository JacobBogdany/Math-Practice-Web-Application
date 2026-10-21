import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  resetPracticeDataStoreForTests,
  saveMistakePattern,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import type { SessionSummaryState } from '../types';
import { SessionSummaryPage } from './SessionSummaryPage';

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

const summaryState: SessionSummaryState = {
  session: {
    id: 'session-summary-test',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:10:00.000Z',
    operations: ['addition', 'subtraction'],
    difficulty: 2,
    sessionLength: 10,
    attempted: 10,
    correct: 8,
    incorrect: 2,
  },
  attempts: [
    {
      id: 'attempt-1',
      questionId: 'question-1',
      operation: 'addition',
      firstOperand: 2,
      secondOperand: 2,
      correctAnswer: 4,
      selectedAnswer: 4,
      selfReportedCorrect: true,
      difficulty: 2,
      source: 'regular',
      attemptedAt: '2026-01-01T00:01:00.000Z',
      sessionId: 'session-summary-test',
    },
    {
      id: 'attempt-2',
      questionId: 'question-2',
      operation: 'subtraction',
      firstOperand: 8,
      secondOperand: 3,
      correctAnswer: 5,
      selectedAnswer: 4,
      selfReportedCorrect: false,
      difficulty: 2,
      source: 'mistake-review',
      attemptedAt: '2026-01-01T00:02:00.000Z',
      sessionId: 'session-summary-test',
    },
  ],
};

function renderSummary(state: SessionSummaryState | null = summaryState) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/practice/summary', state }]}>
      <SessionSummaryPage />
    </MemoryRouter>,
  );
}

describe('SessionSummaryPage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('displays session statistics and configuration details', () => {
    renderSummary();

    expect(
      screen.getByRole('heading', { name: /session complete/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // mistake-review count
    expect(screen.getByText('Addition, Subtraction')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('10 questions')).toBeInTheDocument();
  });

  it('shows summary action buttons', () => {
    renderSummary();

    expect(
      screen.getByRole('link', { name: /practice again/i }),
    ).toHaveAttribute('href', '/practice/session');
    expect(
      screen.getByRole('button', { name: /practice mistakes/i }),
    ).toBeDisabled();
    expect(
      screen.getByText(/no saved mistakes are available to review yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /change settings/i }),
    ).toHaveAttribute('href', '/practice/setup');
    expect(
      screen.getByRole('link', { name: /view statistics/i }),
    ).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('enables practice mistakes button when active mistakes exist', () => {
    saveMistakePattern({
      id: 'pattern-1',
      operation: 'multiplication',
      firstOperand: 6,
      secondOperand: 7,
      correctAnswer: 42,
      difficulty: 2,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-01-01T00:00:00.000Z',
      mastered: false,
    });

    renderSummary();

    const practiceMistakesLink = screen.getByRole('link', {
      name: /practice mistakes \(1\)/i,
    });
    expect(practiceMistakesLink).toBeInTheDocument();
    expect(practiceMistakesLink).toHaveAttribute('href', '/practice/session');
  });
});
