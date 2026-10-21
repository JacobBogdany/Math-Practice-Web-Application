import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ButtonLink } from '../components/common/ButtonLink';
import { QuestionCard } from '../components/practice/QuestionCard';
import { generateQuestionFromOperations } from '../services/questionGenerator';
import type { Question, SessionLength } from '../types';
import { DEFAULT_APP_SETTINGS } from '../types';
import { isValidPracticeSetupConfig } from '../types/practiceSetup';
import './PracticePage.css';

function createQuestion(
  operations: Question['operation'][],
  difficulty: Question['difficulty'],
): Question {
  return generateQuestionFromOperations(operations, difficulty);
}

function getTotalQuestions(
  sessionLength: SessionLength,
): number | 'continuous' {
  return sessionLength === 'continuous' ? 'continuous' : sessionLength;
}

export function PracticePage() {
  const location = useLocation();
  const config = location.state;
  const setupConfig = isValidPracticeSetupConfig(config) ? config : null;
  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState<Question | null>(() =>
    setupConfig
      ? createQuestion(setupConfig.operations, setupConfig.difficulty)
      : null,
  );

  if (!setupConfig || !question) {
    return <Navigate to="/practice/setup" replace />;
  }

  const { operations, difficulty, sessionLength } = setupConfig;
  const totalQuestions = getTotalQuestions(sessionLength);

  function handleResult() {
    setQuestionNumber((current) => current + 1);
    setQuestion(createQuestion(operations, difficulty));
  }

  return (
    <div className="practice-page">
      <QuestionCard
        key={question.id}
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        cardAnimationEnabled={DEFAULT_APP_SETTINGS.cardAnimationEnabled}
        onResult={handleResult}
      />

      <div className="practice-page__actions">
        <ButtonLink to="/practice/setup" state={setupConfig} variant="sky">
          Change Settings
        </ButtonLink>
        <ButtonLink to="/" variant="grape">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
