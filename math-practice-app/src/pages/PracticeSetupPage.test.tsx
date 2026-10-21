import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import {
  loadSettings,
  resetPracticeDataStoreForTests,
  saveMistakePattern,
  saveSettings,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import { DEFAULT_APP_SETTINGS } from '../types/settings';
import { PracticePage } from './PracticePage';
import { PracticeSetupPage } from './PracticeSetupPage';

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

function renderSetupPage() {
  return render(
    <MemoryRouter>
      <AppSettingsProvider>
        <PracticeSetupPage />
      </AppSettingsProvider>
    </MemoryRouter>,
  );
}

describe('PracticeSetupPage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });
  it('renders all setup selectors and a start button', () => {
    renderSetupPage();

    expect(
      screen.getByRole('heading', { name: /practice setup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /addition/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /easy/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /10 questions/i })).toBeChecked();
  });

  it('disables start when no operations are selected', async () => {
    const user = userEvent.setup();
    renderSetupPage();

    await user.click(
      screen.getByRole('button', { name: /select all operations/i }),
    );
    await user.click(screen.getByRole('button', { name: /addition/i }));
    await user.click(screen.getByRole('button', { name: /subtraction/i }));
    await user.click(screen.getByRole('button', { name: /multiplication/i }));
    await user.click(screen.getByRole('button', { name: /division/i }));

    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /please select at least one operation/i,
    );
  });

  it('loads custom defaults from application settings', () => {
    saveSettings({
      ...DEFAULT_APP_SETTINGS,
      defaultOperations: ['multiplication'],
      defaultDifficulty: 4,
      defaultSessionLength: 20,
    });

    renderSetupPage();

    expect(
      screen.getByRole('button', { name: /multiplication/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /addition/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('radio', { name: /advanced/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /20 questions/i })).toBeChecked();
  });

  it('allows defaults to be changed for an individual session without changing settings', async () => {
    const user = userEvent.setup();
    saveSettings({
      ...DEFAULT_APP_SETTINGS,
      defaultOperations: ['multiplication'],
      defaultDifficulty: 4,
      defaultSessionLength: 20,
    });

    renderSetupPage();

    // Select addition as well and switch difficulty to Beginner
    await user.click(screen.getByRole('button', { name: /addition/i }));
    await user.click(screen.getByRole('radio', { name: /beginner/i }));

    expect(screen.getByRole('button', { name: /addition/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('radio', { name: /beginner/i })).toBeChecked();

    // The persistent settings should remain unchanged
    const stored = loadSettings();
    expect(stored.defaultOperations).toEqual(['multiplication']);
    expect(stored.defaultDifficulty).toBe(4);
  });

  it('handles mistake review mode state properly based on available mistakes', async () => {
    const user = userEvent.setup();

    // When no mistakes exist
    const { unmount } = renderSetupPage();
    const mistakeReviewRadio = screen.getByRole('radio', {
      name: /mistake review/i,
    });
    expect(mistakeReviewRadio).toBeDisabled();
    expect(
      screen.getByText(/no active mistakes available to review yet/i),
    ).toBeInTheDocument();
    unmount();

    // Seed active mistake pattern
    saveMistakePattern({
      id: 'pattern-1',
      operation: 'addition',
      firstOperand: 4,
      secondOperand: 5,
      correctAnswer: 9,
      difficulty: 1,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-01-01T00:00:00.000Z',
      mastered: false,
    });

    renderSetupPage();
    const activeRadio = screen.getByRole('radio', { name: /mistake review/i });
    expect(activeRadio).not.toBeDisabled();
    expect(screen.getAllByText(/1 active/i).length).toBeGreaterThan(0);

    await user.click(activeRadio);
    expect(activeRadio).toBeChecked();
    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).not.toBeDisabled();
  });
});

describe('Practice session flow', () => {
  it('passes setup configuration to the practice session page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/practice/setup']}>
        <Routes>
          <Route path="/practice/setup" element={<PracticeSetupPage />} />
          <Route path="/practice/session" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /addition/i }));
    await user.click(screen.getByRole('button', { name: /subtraction/i }));
    await user.click(screen.getByRole('button', { name: /division/i }));
    await user.click(screen.getByRole('radio', { name: /beginner/i }));
    await user.click(screen.getByRole('radio', { name: /5 questions/i }));
    await user.click(screen.getByRole('button', { name: /start session/i }));

    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /flip card/i }),
    ).toBeInTheDocument();
  });

  it('redirects to setup when session config is missing', () => {
    render(
      <MemoryRouter initialEntries={['/practice/session']}>
        <Routes>
          <Route path="/practice/setup" element={<PracticeSetupPage />} />
          <Route path="/practice/session" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /practice setup/i }),
    ).toBeInTheDocument();
  });
});
