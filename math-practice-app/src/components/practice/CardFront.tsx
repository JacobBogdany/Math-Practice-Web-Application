import type { Question } from '../../types';
import { formatQuestionProgress } from '../../services/generators/shared';
import { Button } from '../common/Button';
import { AnswerChoice } from './AnswerChoice';
import './CardFront.css';

export interface CardFrontProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number | 'continuous';
  selectedAnswer: number | null;
  choicesDisabled: boolean;
  onSelectAnswer: (answer: number) => void;
  onFlip: () => void;
}

export function CardFront({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  choicesDisabled,
  onSelectAnswer,
  onFlip,
}: CardFrontProps) {
  return (
    <div className="card-front">
      <p className="card-front__progress">
        {formatQuestionProgress(questionNumber, totalQuestions)}
      </p>
      <p className="card-front__question" aria-label="Math question">
        {question.displayText}
      </p>
      <div
        className="card-front__choices"
        role="group"
        aria-label="Answer choices"
      >
        {question.choices.map((choice, index) => (
          <AnswerChoice
            key={`${question.id}-${choice}-${index}`}
            value={choice}
            choiceNumber={index + 1}
            selected={selectedAnswer === choice}
            disabled={choicesDisabled}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>
      <Button
        variant="sky"
        icon="↻"
        block
        disabled={selectedAnswer === null}
        onClick={onFlip}
      >
        Flip Card
      </Button>
    </div>
  );
}
