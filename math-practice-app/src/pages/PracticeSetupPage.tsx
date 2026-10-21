import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { DifficultySelector } from '../components/practice/DifficultySelector';
import { OperationSelector } from '../components/practice/OperationSelector';
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector';
import { useAppSettings } from '../context/useAppSettings';
import type { DifficultyLevel, MathOperation, SessionLength } from '../types';
import type { PracticeSetupConfig } from '../types/practiceSetup';
import './PracticeSetupPage.css';

export function PracticeSetupPage() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  const [operations, setOperations] = useState<MathOperation[]>(
    () => settings.defaultOperations,
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    () => settings.defaultDifficulty,
  );
  const [sessionLength, setSessionLength] = useState<SessionLength>(
    () => settings.defaultSessionLength,
  );

  const canStart = operations.length > 0;

  function handleStartSession() {
    if (!canStart) {
      return;
    }

    const config: PracticeSetupConfig = {
      operations,
      difficulty,
      sessionLength,
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
        <OperationSelector selected={operations} onChange={setOperations} />
        <DifficultySelector selected={difficulty} onChange={setDifficulty} />
        <SessionLengthSelector
          selected={sessionLength}
          onChange={setSessionLength}
        />

        {operations.length === 0 ? (
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
