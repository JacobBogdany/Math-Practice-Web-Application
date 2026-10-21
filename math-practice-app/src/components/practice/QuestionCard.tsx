import { useState } from 'react';
import type { Question } from '../../types';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
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

  function handleSelectAnswer(answer: number) {
    if (isCardFlipped) {
      return;
    }
    setSelectedAnswer(answer);
  }

  function handleFlip() {
    if (selectedAnswer === null || isCardFlipped) {
      return;
    }
    setIsCardFlipped(true);
  }

  function handleResult(selfReportedCorrect: boolean) {
    if (resultRecorded || selectedAnswer === null) {
      return;
    }
    setResultRecorded(true);
    onResult(selfReportedCorrect, selectedAnswer);
  }

  const innerClassName = [
    'question-card__inner',
    isCardFlipped ? 'question-card__inner--flipped' : '',
    animationsEnabled ? '' : 'question-card__inner--no-animation',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="question-card" aria-label="Practice question card">
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
