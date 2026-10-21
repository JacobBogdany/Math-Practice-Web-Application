import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { DifficultySelector } from '../components/practice/DifficultySelector';
import { OperationSelector } from '../components/practice/OperationSelector';
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector';
import { useAppSettings } from '../context/useAppSettings';
import { loadMistakePatterns } from '../services/storage/practiceDataStore';
import { getActiveMistakePatterns } from '../services/mistakePriority';
import type {
  DifficultyLevel,
  MathOperation,
  ReviewMode,
  SessionLength,
} from '../types';
import type { PracticeSetupConfig } from '../types/practiceSetup';
import './PracticeSetupPage.css';

export function PracticeSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAppSettings();

  const activeMistakesCount = useMemo(() => {
    return getActiveMistakePatterns(loadMistakePatterns()).length;
  }, []);

  const requestedMode = (location.state as { mode?: ReviewMode } | null)?.mode;
  const initialMode: ReviewMode =
    requestedMode === 'mistake-review' && activeMistakesCount > 0
      ? 'mistake-review'
      : 'regular';

  const [mode, setMode] = useState<ReviewMode>(initialMode);
  const [operations, setOperations] = useState<MathOperation[]>(
    () => settings.defaultOperations,
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    () => settings.defaultDifficulty,
  );
  const [sessionLength, setSessionLength] = useState<SessionLength>(
    () => settings.defaultSessionLength,
  );

  const canStart =
    mode === 'mistake-review' ? activeMistakesCount > 0 : operations.length > 0;

  function handleStartSession() {
    if (!canStart) {
      return;
    }

    const config: PracticeSetupConfig = {
      operations,
      difficulty,
      sessionLength,
      mode,
    };

    navigate('/practice/session', { state: config });
  }

  return (
    <div className="practice-setup">
      <section className="practice-setup__intro" aria-labelledby="setup-title">
        <h1 id="setup-title" className="practice-setup__title">
          Practice Setup
        </h1>
        <p className="practice-setup__message">
          Choose what you want to practice today, then start your session!
        </p>
      </section>

      <section className="practice-setup__panel" aria-label="Session options">
        <fieldset className="selector-group">
          <legend className="selector-group__legend">Practice Mode</legend>
          <p className="selector-group__hint">
            Choose regular math practice or review questions from past mistakes.
          </p>
          <div
            className="selector-group__radio-list"
            role="radiogroup"
            aria-label="Practice mode"
          >
            <label
              htmlFor="mode-regular"
              className={
                mode === 'regular'
                  ? 'selector-group__radio-option selector-group__radio-option--selected'
                  : 'selector-group__radio-option'
              }
            >
              <input
                id="mode-regular"
                type="radio"
                name="practiceMode"
                value="regular"
                className="selector-group__radio-input"
                checked={mode === 'regular'}
                onChange={() => setMode('regular')}
              />
              <span className="selector-group__radio-content">
                <span className="selector-group__radio-label">
                  Regular Practice
                </span>
                <span className="selector-group__radio-description">
                  Practice standard math questions matching your selected
                  operations and difficulty.
                </span>
              </span>
            </label>

            <label
              htmlFor="mode-mistake-review"
              className={
                mode === 'mistake-review'
                  ? 'selector-group__radio-option selector-group__radio-option--selected'
                  : activeMistakesCount === 0
                    ? 'selector-group__radio-option selector-group__radio-option--disabled'
                    : 'selector-group__radio-option'
              }
            >
              <input
                id="mode-mistake-review"
                type="radio"
                name="practiceMode"
                value="mistake-review"
                className="selector-group__radio-input"
                checked={mode === 'mistake-review'}
                disabled={activeMistakesCount === 0}
                onChange={() => setMode('mistake-review')}
              />
              <span className="selector-group__radio-content">
                <span className="selector-group__radio-label">
                  Mistake Review
                  {activeMistakesCount > 0 ? (
                    <span className="practice-setup__badge">
                      {activeMistakesCount} active
                    </span>
                  ) : null}
                </span>
                <span className="selector-group__radio-description">
                  {activeMistakesCount > 0
                    ? `Review similar questions generated from your ${activeMistakesCount} active mistake pattern${
                        activeMistakesCount === 1 ? '' : 's'
                      }.`
                    : 'No active mistakes available to review yet. Complete regular practice first!'}
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        {mode === 'regular' ? (
          <>
            <OperationSelector selected={operations} onChange={setOperations} />
            <DifficultySelector
              selected={difficulty}
              onChange={setDifficulty}
            />
          </>
        ) : null}

        <SessionLengthSelector
          selected={sessionLength}
          onChange={setSessionLength}
        />

        {mode === 'regular' && operations.length === 0 ? (
          <p className="practice-setup__validation" role="alert">
            Please select at least one operation before starting.
          </p>
        ) : null}
      </section>

      <div className="practice-setup__actions">
        <Button
          variant="sky"
          icon="▶"
          block
          disabled={!canStart}
          onClick={handleStartSession}
        >
          Start Session
        </Button>
        <ButtonLink to="/" variant="grape">
          Back to Home
        </ButtonLink>
      </div>
    </div>
  );
}
