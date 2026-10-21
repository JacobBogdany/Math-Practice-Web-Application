import type { SessionLength } from '../../types';
import { SESSION_LENGTH_OPTIONS } from '../../constants/practiceSetup';
import './SelectorGroup.css';

export interface SessionLengthSelectorProps {
  selected: SessionLength;
  onChange: (sessionLength: SessionLength) => void;
}

export function SessionLengthSelector({
  selected,
  onChange,
}: SessionLengthSelectorProps) {
  return (
    <fieldset className="selector-group">
      <legend className="selector-group__legend">Session Length</legend>
      <p className="selector-group__hint">
        How many questions would you like to try?
      </p>
      <div
        className="selector-group__chips"
        role="radiogroup"
        aria-label="Session length"
      >
        {SESSION_LENGTH_OPTIONS.map(({ value, label }) => {
          const inputId = `session-length-${value}`;

          return (
            <label
              key={String(value)}
              htmlFor={inputId}
              className={
                selected === value
                  ? 'selector-group__option selector-group__option--selected selector-group__chip'
                  : 'selector-group__option selector-group__chip'
              }
            >
              <input
                id={inputId}
                type="radio"
                name="session-length"
                className="selector-group__radio-input selector-group__radio-input--hidden"
                value={value}
                checked={selected === value}
                onChange={() => onChange(value)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
