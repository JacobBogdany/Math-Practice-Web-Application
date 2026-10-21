import './AnswerChoice.css';

export interface AnswerChoiceProps {
  value: number;
  choiceNumber: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (value: number) => void;
}

export function AnswerChoice({
  value,
  choiceNumber,
  selected,
  disabled,
  onSelect,
}: AnswerChoiceProps) {
  return (
    <button
      type="button"
      className={
        selected ? 'answer-choice answer-choice--selected' : 'answer-choice'
      }
      aria-label={`Answer choice ${choiceNumber}: ${value}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(value)}
    >
      {value}
    </button>
  );
}
