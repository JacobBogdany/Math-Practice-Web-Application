import { useCallback, useEffect, useState } from 'react';
import type { Question } from '../../types';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import {
  formatQuestionProgress,
  formatSolvedText,
} from '../../services/generators/shared';
import { CardBack } from './CardBack';
import { CardFront } from './CardFront';
import './QuestionCard.css';

export interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number | 'continuous';
  cardAnimationEnabled?: boolean;
  onResult: (selfReportedCorrect: boolean, selectedAnswer: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  cardAnimationEnabled = true,
  onResult,
}: QuestionCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationsEnabled = cardAnimationEnabled && !prefersReducedMotion;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [resultRecorded, setResultRecorded] = useState(false);

  const handleSelectAnswer = useCallback(
    (answer: number) => {
      if (isCardFlipped) {
        return;
      }
      setSelectedAnswer(answer);
    },
    [isCardFlipped],
  );

  const handleFlip = useCallback(() => {
    if (selectedAnswer === null || isCardFlipped) {
      return;
    }
    setIsCardFlipped(true);
  }, [isCardFlipped, selectedAnswer]);

  const handleResult = useCallback(
    (selfReportedCorrect: boolean) => {
      if (resultRecorded || selectedAnswer === null) {
        return;
      }
      setResultRecorded(true);
      onResult(selfReportedCorrect, selectedAnswer);
    },
    [onResult, resultRecorded, selectedAnswer],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!isCardFlipped) {
        if (['1', '2', '3', '4'].includes(event.key)) {
          const index = parseInt(event.key, 10) - 1;
          const choice = question.choices[index];
          if (choice !== undefined) {
            event.preventDefault();
            handleSelectAnswer(choice);
          }
        } else if (event.key === ' ' || event.key === 'Enter') {
          if (selectedAnswer !== null && target?.tagName !== 'BUTTON') {
            event.preventDefault();
            handleFlip();
          }
        }
      } else if (!resultRecorded) {
        if (['1', 'r', 'R', 'y', 'Y'].includes(event.key)) {
          event.preventDefault();
          handleResult(true);
        } else if (['2', 'w', 'W', 'n', 'N'].includes(event.key)) {
          event.preventDefault();
          handleResult(false);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleFlip,
    handleResult,
    handleSelectAnswer,
    isCardFlipped,
    question.choices,
    resultRecorded,
    selectedAnswer,
  ]);

  const liveAnnouncement = !isCardFlipped
    ? `${formatQuestionProgress(questionNumber, totalQuestions)}: ${question.displayText}`
    : `Answer revealed: ${formatSolvedText(question)}. You selected ${selectedAnswer}.`;

  const innerClassName = [
    'question-card__inner',
    isCardFlipped ? 'question-card__inner--flipped' : '',
    animationsEnabled ? '' : 'question-card__inner--no-animation',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="question-card" aria-label="Practice question card">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
      <div className="question-card__surface">
        <div className={animationsEnabled ? 'question-card__scene' : undefined}>
          <div className={innerClassName}>
            <div className="question-card__face question-card__face--front">
              <CardFront
                question={question}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                selectedAnswer={selectedAnswer}
                choicesDisabled={isCardFlipped}
                onSelectAnswer={handleSelectAnswer}
                onFlip={handleFlip}
              />
            </div>
            {selectedAnswer !== null ? (
              <div className="question-card__face question-card__face--back">
                <CardBack
                  question={question}
                  selectedAnswer={selectedAnswer}
                  resultRecorded={resultRecorded}
                  onRight={() => handleResult(true)}
                  onWrong={() => handleResult(false)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
