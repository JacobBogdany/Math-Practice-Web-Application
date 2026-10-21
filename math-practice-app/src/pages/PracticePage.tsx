import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProgressBar } from '../components/practice/ProgressBar';
import { QuestionCard } from '../components/practice/QuestionCard';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { DEFAULT_APP_SETTINGS } from '../types';
import type { PracticeSetupConfig } from '../types/practiceSetup';
import { isValidPracticeSetupConfig } from '../types/practiceSetup';
import './PracticePage.css';

export function PracticePage() {
  const location = useLocation();
  const config = location.state;
  const setupConfig = isValidPracticeSetupConfig(config) ? config : null;
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  if (!setupConfig) {
    return <Navigate to="/practice/setup" replace />;
  }

  return (
    <PracticeSessionContent
      setupConfig={setupConfig}
      showEndConfirm={showEndConfirm}
      onOpenEndConfirm={() => setShowEndConfirm(true)}
      onCloseEndConfirm={() => setShowEndConfirm(false)}
    />
  );
}

interface PracticeSessionContentProps {
  setupConfig: PracticeSetupConfig;
  showEndConfirm: boolean;
  onOpenEndConfirm: () => void;
  onCloseEndConfirm: () => void;
}

function PracticeSessionContent({
  setupConfig,
  showEndConfirm,
  onOpenEndConfirm,
  onCloseEndConfirm,
}: PracticeSessionContentProps) {
  const {
    session,
    currentQuestion,
    currentQuestionIndex,
    isActive,
    isTransitioning,
    totalQuestions,
    isContinuous,
    recordResult,
    endSession,
  } = usePracticeSession(setupConfig);

  if (!isActive && session.completedAt) {
    return null;
  }

  return (
    <div className="practice-page">
      <div className="practice-page__header">
        {!isContinuous && typeof totalQuestions === 'number' ? (
          <ProgressBar
            completed={session.attempted}
            total={totalQuestions}
            label={`${session.attempted} of ${totalQuestions} questions completed`}
          />
        ) : null}
      </div>

      <div
        className={
          isTransitioning
            ? 'practice-page__card-area practice-page__card-area--transitioning'
            : 'practice-page__card-area'
        }
      >
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentQuestionIndex}
          totalQuestions={totalQuestions}
          cardAnimationEnabled={DEFAULT_APP_SETTINGS.cardAnimationEnabled}
          onResult={(selfReportedCorrect, selectedAnswer) => {
            recordResult(currentQuestion, selectedAnswer, selfReportedCorrect);
          }}
        />
      </div>

      <div className="practice-page__actions">
        {isContinuous ? (
          <Button variant="coral" block onClick={onOpenEndConfirm}>
            End Session
          </Button>
        ) : null}
      </div>

      {showEndConfirm ? (
        <ConfirmDialog
          title="End practice session?"
          message="Your progress so far will be saved in the session summary."
          confirmLabel="End Session"
          cancelLabel="Keep Practicing"
          onConfirm={() => {
            onCloseEndConfirm();
            endSession();
          }}
          onCancel={onCloseEndConfirm}
        />
      ) : null}
    </div>
  );
}
