import type { DifficultyLevel } from '../../types';
import { DIFFICULTY_OPTIONS } from '../../constants/practiceSetup';
import './SelectorGroup.css';

export interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
}

export function DifficultySelector({
  selected,
  onChange,
}: DifficultySelectorProps) {
  return (
    <fieldset className="selector-group">
      <legend className="selector-group__legend">Difficulty</legend>
      <p className="selector-group__hint">Choose one level for this session.</p>
      <div
        className="selector-group__radio-list"
        role="radiogroup"
        aria-label="Difficulty"
      >
        {DIFFICULTY_OPTIONS.map(({ value, label, description }) => {
          const inputId = `difficulty-${value}`;

          return (
            <label
              key={value}
              htmlFor={inputId}
              className={
                selected === value
                  ? 'selector-group__radio-option selector-group__radio-option--selected'
                  : 'selector-group__radio-option'
              }
            >
              <input
                id={inputId}
                type="radio"
                name="difficulty"
                className="selector-group__radio-input"
                value={value}
                checked={selected === value}
                onChange={() => onChange(value)}
              />
              <span className="selector-group__radio-content">
                <span className="selector-group__radio-label">{label}</span>
                <span className="selector-group__radio-description">
                  {description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
