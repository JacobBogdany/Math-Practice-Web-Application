import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import {
  loadAttempts,
  loadSessions,
  loadSettings,
  resetPracticeDataStoreForTests,
  saveAttempt,
  saveSession,
} from '../services/storage/practiceDataStore';
import { setStorageAdapter } from '../services/storage/storageService';
import type { PracticeAttempt, PracticeSession } from '../types';
import { SettingsPage } from './SettingsPage';

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

function renderSettingsPage(initialRoute = '/settings') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppSettingsProvider>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/practice/setup" element={<div>Setup Page</div>} />
        </Routes>
      </AppSettingsProvider>
    </MemoryRouter>,
  );
}

const mockSession: PracticeSession = {
  id: 'session-test-1',
  startedAt: '2026-01-15T10:00:00.000Z',
  operations: ['addition'],
  difficulty: 2,
  sessionLength: 10,
  attempted: 1,
  correct: 1,
  incorrect: 0,
};

const mockAttempt: PracticeAttempt = {
  id: 'attempt-test-1',
  questionId: 'question-1',
  operation: 'addition',
  firstOperand: 2,
  secondOperand: 3,
  correctAnswer: 5,
  selectedAnswer: 5,
  selfReportedCorrect: true,
  difficulty: 2,
  source: 'regular',
  attemptedAt: '2026-01-15T10:01:00.000Z',
  sessionId: mockSession.id,
};

describe('SettingsPage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
    resetPracticeDataStoreForTests();
  });

  it('renders all settings options with initial defaults', () => {
    renderSettingsPage();

    expect(
      screen.getByRole('heading', { name: /settings/i }),
    ).toBeInTheDocument();

    // Toggles
    expect(
      screen.getByRole('checkbox', { name: /sound effects/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /card animation/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /show explanations/i }),
    ).toBeChecked();

    // Default operations
    expect(screen.getByRole('checkbox', { name: /addition/i })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /subtraction/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /multiplication/i }),
    ).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /division/i })).toBeChecked();

    // Default difficulty
    expect(screen.getByRole('radio', { name: /easy/i })).toBeChecked();

    // Default session length
    expect(screen.getByRole('radio', { name: /10 questions/i })).toBeChecked();

    // Mastery threshold
    const masteryInput = screen.getByLabelText(/mistake mastery threshold/i);
    expect(masteryInput).toHaveValue(3);

    // Save and Danger zone buttons
    expect(
      screen.getByRole('button', { name: /save settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /clear all application data/i }),
    ).toBeInTheDocument();
  });

  it('updates experience toggles and persists to storage', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const soundToggle = screen.getByRole('checkbox', {
      name: /sound effects/i,
    });
    const animToggle = screen.getByRole('checkbox', {
      name: /card animation/i,
    });
    const expToggle = screen.getByRole('checkbox', {
      name: /show explanations/i,
    });

    await user.click(soundToggle);
    await user.click(animToggle);
    await user.click(expToggle);

    expect(soundToggle).not.toBeChecked();
    expect(animToggle).not.toBeChecked();
    expect(expToggle).not.toBeChecked();

    const saved = loadSettings();
    expect(saved.soundEffectsEnabled).toBe(false);
    expect(saved.cardAnimationEnabled).toBe(false);
    expect(saved.showExplanations).toBe(false);
  });

  it('updates default operations and shows validation alert when unchecking all', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const addCheckbox = screen.getByRole('checkbox', { name: /addition/i });
    const subCheckbox = screen.getByRole('checkbox', { name: /subtraction/i });
    const mulCheckbox = screen.getByRole('checkbox', {
      name: /multiplication/i,
    });
    const divCheckbox = screen.getByRole('checkbox', { name: /division/i });

    // Deselect addition, subtraction, multiplication
    await user.click(addCheckbox);
    await user.click(subCheckbox);
    await user.click(mulCheckbox);

    expect(addCheckbox).not.toBeChecked();
    expect(divCheckbox).toBeChecked();

    // Attempt to deselect the last remaining operation (division)
    await user.click(divCheckbox);
    expect(divCheckbox).toBeChecked();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /at least one default operation must be selected/i,
    );

    // Select all operations shortcut button
    await user.click(
      screen.getByRole('button', { name: /select all operations/i }),
    );
    expect(addCheckbox).toBeChecked();
    expect(subCheckbox).toBeChecked();
    expect(mulCheckbox).toBeChecked();
    expect(divCheckbox).toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('updates default difficulty and default session length', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const advancedRadio = screen.getByRole('radio', { name: /advanced/i });
    await user.click(advancedRadio);
    expect(advancedRadio).toBeChecked();

    const lengthRadio = screen.getByRole('radio', { name: /20 questions/i });
    await user.click(lengthRadio);
    expect(lengthRadio).toBeChecked();

    const saved = loadSettings();
    expect(saved.defaultDifficulty).toBe(4);
    expect(saved.defaultSessionLength).toBe(20);
  });

  it('updates mastery threshold', () => {
    renderSettingsPage();

    const masteryInput = screen.getByLabelText(/mistake mastery threshold/i);
    fireEvent.change(masteryInput, { target: { value: '5' } });

    expect(masteryInput).toHaveValue(5);
    expect(loadSettings().masteryThreshold).toBe(5);
  });

  it('displays feedback when clicking save settings', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    await user.click(screen.getByRole('button', { name: /save settings/i }));
    expect(screen.getByRole('status')).toHaveTextContent(
      /settings saved successfully/i,
    );
  });

  it('clears all application data after confirmation and redirects to home', async () => {
    const user = userEvent.setup();

    // Seed data
    saveSession(mockSession);
    saveAttempt(mockAttempt);
    expect(loadSessions()).toHaveLength(1);
    expect(loadAttempts()).toHaveLength(1);

    renderSettingsPage();

    // Trigger clear
    await user.click(
      screen.getByRole('button', { name: /clear all application data/i }),
    );

    const dialog = screen.getByRole('alertdialog');
    expect(
      within(dialog).getByText(/permanently erase all practice history/i),
    ).toBeInTheDocument();

    // Confirm
    await user.click(
      within(dialog).getByRole('button', { name: /clear all data/i }),
    );

    // Verify redirected to Home Page
    expect(screen.getByText('Home Page')).toBeInTheDocument();

    // Verify data cleared in storage
    expect(loadSessions()).toHaveLength(0);
    expect(loadAttempts()).toHaveLength(0);
  });

  it('closes confirmation dialog without clearing when cancelled', async () => {
    const user = userEvent.setup();

    saveSession(mockSession);
    renderSettingsPage();

    await user.click(
      screen.getByRole('button', { name: /clear all application data/i }),
    );
    const dialog = screen.getByRole('alertdialog');

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(loadSessions()).toHaveLength(1);
  });
});
