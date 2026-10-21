import type { Question } from '../../types';
import { formatSolvedText } from '../../services/generators/shared';
import { Button } from '../common/Button';
import './CardBack.css';

export interface CardBackProps {
  question: Question;
  selectedAnswer: number;
  resultRecorded: boolean;
  onRight: () => void;
  onWrong: () => void;
}

export function CardBack({
  question,
  selectedAnswer,
  resultRecorded,
  onRight,
  onWrong,
}: CardBackProps) {
  return (
    <div className="card-back">
      <p className="card-back__question" aria-label="Correct answer revealed">
        {formatSolvedText(question)}
      </p>
      <div className="card-back__answer-block">
        <span className="card-back__label">Your answer</span>
        <span className="card-back__value">{selectedAnswer}</span>
      </div>
      <div className="card-back__actions">
        <Button variant="sun" block disabled={resultRecorded} onClick={onRight}>
          I Got It Right
        </Button>
        <Button
          variant="coral"
          block
          disabled={resultRecorded}
          onClick={onWrong}
        >
          I Got It Wrong
        </Button>
      </div>
    </div>
  );
}
