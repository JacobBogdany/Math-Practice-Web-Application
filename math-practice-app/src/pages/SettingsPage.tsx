import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  ALL_MATH_OPERATIONS,
  DIFFICULTY_OPTIONS,
  OPERATION_OPTIONS,
  SESSION_LENGTH_OPTIONS,
} from '../constants/practiceSetup';
import { useAppSettings } from '../context/useAppSettings';
import type { DifficultyLevel, MathOperation, SessionLength } from '../types';
import './SettingsPage.css';

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetAllData } = useAppSettings();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [operationsError, setOperationsError] = useState<string | null>(null);

  function handleToggleSoundEffects(enabled: boolean) {
    updateSettings({ soundEffectsEnabled: enabled });
  }

  function handleToggleCardAnimation(enabled: boolean) {
    updateSettings({ cardAnimationEnabled: enabled });
  }

  function handleToggleShowExplanations(enabled: boolean) {
    updateSettings({ showExplanations: enabled });
  }

  function handleToggleOperation(op: MathOperation) {
    if (settings.defaultOperations.includes(op)) {
      if (settings.defaultOperations.length === 1) {
        setOperationsError('At least one default operation must be selected.');
        return;
      }
      setOperationsError(null);
      updateSettings({
        defaultOperations: settings.defaultOperations.filter(
          (item) => item !== op,
        ),
      });
    } else {
      setOperationsError(null);
      updateSettings({
        defaultOperations: [...settings.defaultOperations, op],
      });
    }
  }

  function handleSelectAllOperations() {
    setOperationsError(null);
    updateSettings({ defaultOperations: [...ALL_MATH_OPERATIONS] });
  }

  function handleDifficultyChange(level: DifficultyLevel) {
    updateSettings({ defaultDifficulty: level });
  }

  function handleSessionLengthChange(length: SessionLength) {
    updateSettings({ defaultSessionLength: length });
  }

  function handleMasteryThresholdChange(rawValue: string) {
    if (rawValue === '') {
      return;
    }
    const num = Number(rawValue);
    if (!Number.isNaN(num)) {
      const clamped = Math.max(1, Math.min(10, Math.round(num)));
      updateSettings({ masteryThreshold: clamped });
    }
  }

  function handleSaveClick() {
    updateSettings({});
    setSaveSuccessMessage('Settings saved successfully!');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3000);
  }

  function handleConfirmClearAllData() {
    resetAllData();
    setShowClearConfirm(false);
    navigate('/');
  }

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
        <p className="settings-page__subtitle">
          Customize your experience, configure default practice options, and
          manage your data.
        </p>
      </header>

      {/* Preferences Section: Audio & Visual Toggles */}
      <section
        className="settings-section"
        aria-labelledby="experience-settings-heading"
      >
        <h2
          id="experience-settings-heading"
          className="settings-section__title"
        >
          Preferences
        </h2>
        <div className="settings-grid">
          <label className="settings-toggle" htmlFor="setting-sound">
            <span className="settings-toggle__content">
              <span className="settings-toggle__label">Sound Effects</span>
              <span className="settings-toggle__description">
                Play sound effects during practice and session milestones.
              </span>
            </span>
            <input
              id="setting-sound"
              type="checkbox"
              className="settings-toggle__checkbox"
              checked={settings.soundEffectsEnabled}
              onChange={(e) => handleToggleSoundEffects(e.target.checked)}
              aria-label="Sound effects"
            />
          </label>

          <label className="settings-toggle" htmlFor="setting-animation">
            <span className="settings-toggle__content">
              <span className="settings-toggle__label">
                Card Flip Animation
              </span>
              <span className="settings-toggle__description">
                Use 3D flip animation when revealing answer cards (honors
                reduced motion).
              </span>
            </span>
            <input
              id="setting-animation"
              type="checkbox"
              className="settings-toggle__checkbox"
              checked={settings.cardAnimationEnabled}
              onChange={(e) => handleToggleCardAnimation(e.target.checked)}
              aria-label="Card animation"
            />
          </label>

          <label className="settings-toggle" htmlFor="setting-explanations">
            <span className="settings-toggle__content">
              <span className="settings-toggle__label">Show Explanations</span>
              <span className="settings-toggle__description">
                Display helpful explanations and steps on the back of cards.
              </span>
            </span>
            <input
              id="setting-explanations"
              type="checkbox"
              className="settings-toggle__checkbox"
              checked={settings.showExplanations}
              onChange={(e) => handleToggleShowExplanations(e.target.checked)}
              aria-label="Show explanations"
            />
          </label>
        </div>
      </section>

      {/* Practice Defaults Section */}
      <section
        className="settings-section"
        aria-labelledby="practice-defaults-heading"
      >
        <h2 id="practice-defaults-heading" className="settings-section__title">
          Practice Defaults
        </h2>
        <p className="settings-section__hint">
          These settings will be pre-selected each time you start a new practice
          session.
        </p>

        {/* Default Operations */}
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">
            Default Operations
          </legend>
          <div className="settings-fieldset__toolbar">
            <button
              type="button"
              className="settings-shortcut-btn"
              onClick={handleSelectAllOperations}
            >
              Select All Operations
            </button>
          </div>
          <div
            className="settings-options-row"
            role="group"
            aria-label="Default operations"
          >
            {OPERATION_OPTIONS.map(({ value, label, symbol }) => {
              const isChecked = settings.defaultOperations.includes(value);
              const inputId = `setting-operation-${value}`;
              return (
                <label
                  key={value}
                  htmlFor={inputId}
                  className={`settings-chip ${isChecked ? 'settings-chip--checked' : ''}`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    className="settings-chip__input"
                    checked={isChecked}
                    onChange={() => handleToggleOperation(value)}
                  />
                  <span className="settings-chip__symbol" aria-hidden="true">
                    {symbol}
                  </span>
                  <span className="settings-chip__label">{label}</span>
                </label>
              );
            })}
          </div>
          {operationsError ? (
            <p className="settings-validation-alert" role="alert">
              {operationsError}
            </p>
          ) : null}
        </fieldset>

        {/* Default Difficulty */}
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">
            Default Difficulty
          </legend>
          <div
            className="settings-radio-list"
            role="radiogroup"
            aria-label="Default difficulty"
          >
            {DIFFICULTY_OPTIONS.map(({ value, label, description }) => {
              const inputId = `setting-difficulty-${value}`;
              const isChecked = settings.defaultDifficulty === value;
              return (
                <label
                  key={value}
                  htmlFor={inputId}
                  className={`settings-radio-option ${isChecked ? 'settings-radio-option--selected' : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="defaultDifficulty"
                    value={value}
                    className="settings-radio-option__input"
                    checked={isChecked}
                    onChange={() => handleDifficultyChange(value)}
                  />
                  <div className="settings-radio-option__content">
                    <span className="settings-radio-option__title">
                      {label}
                    </span>
                    <span className="settings-radio-option__desc">
                      {description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Default Session Length */}
        <fieldset className="settings-fieldset">
          <legend className="settings-fieldset__legend">
            Default Session Length
          </legend>
          <div
            className="settings-chips-group"
            role="radiogroup"
            aria-label="Default session length"
          >
            {SESSION_LENGTH_OPTIONS.map(({ value, label }) => {
              const inputId = `setting-session-length-${value}`;
              const isChecked = settings.defaultSessionLength === value;
              return (
                <label
                  key={String(value)}
                  htmlFor={inputId}
                  className={`settings-chip ${isChecked ? 'settings-chip--checked' : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="defaultSessionLength"
                    value={value}
                    className="settings-chip__input"
                    checked={isChecked}
                    onChange={() => handleSessionLengthChange(value)}
                  />
                  <span className="settings-chip__label">{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Mastery Threshold */}
        <div className="settings-field">
          <label
            htmlFor="setting-mastery-threshold"
            className="settings-field__label"
          >
            Mistake Mastery Threshold
          </label>
          <p className="settings-field__hint">
            Number of correct similar questions required to master an incorrect
            question pattern (1–10).
          </p>
          <div className="settings-field__control">
            <input
              id="setting-mastery-threshold"
              type="number"
              min={1}
              max={10}
              value={settings.masteryThreshold}
              onChange={(e) => handleMasteryThresholdChange(e.target.value)}
              className="settings-number-input"
            />
          </div>
        </div>
      </section>

      {/* Save Settings Bar */}
      <section className="settings-actions-bar">
        <div className="settings-actions-bar__info">
          <span className="settings-actions-bar__status">
            All settings are saved automatically.
          </span>
          {saveSuccessMessage ? (
            <span className="settings-actions-bar__success" role="status">
              ✓ {saveSuccessMessage}
            </span>
          ) : null}
        </div>
        <Button variant="sky" onClick={handleSaveClick}>
          Save Settings
        </Button>
      </section>

      {/* Danger Zone: Clear All Application Data */}
      <section
        className="settings-section settings-section--danger"
        aria-labelledby="data-management-heading"
      >
        <h2
          id="data-management-heading"
          className="settings-section__title settings-section__title--danger"
        >
          Data Management
        </h2>
        <p className="settings-section__hint">
          Permanently clear all stored practice attempts, sessions, statistics,
          and mistake patterns, and restore all settings to default.
        </p>
        <div className="settings-danger-action">
          <Button variant="coral" onClick={() => setShowClearConfirm(true)}>
            Clear All Application Data
          </Button>
        </div>
      </section>

      {/* Navigation Links */}
      <nav className="settings-page__nav" aria-label="Settings navigation">
        <ButtonLink to="/" variant="grape">
          Back to Home
        </ButtonLink>
        <ButtonLink to="/practice/setup" variant="sky">
          Start Practice
        </ButtonLink>
      </nav>

      {showClearConfirm ? (
        <ConfirmDialog
          title="Clear All Application Data?"
          message="Are you sure you want to permanently erase all practice history, statistics, and mistake patterns, and reset all settings to defaults? This action cannot be undone."
          confirmLabel="Clear All Data"
          cancelLabel="Cancel"
          onConfirm={handleConfirmClearAllData}
          onCancel={() => setShowClearConfirm(false)}
        />
      ) : null}
    </div>
  );
}
