import type { MathOperation } from '../../types';
import {
  ALL_MATH_OPERATIONS,
  OPERATION_OPTIONS,
} from '../../constants/practiceSetup';
import './SelectorGroup.css';

export interface OperationSelectorProps {
  selected: MathOperation[];
  onChange: (operations: MathOperation[]) => void;
}

function toggleOperation(
  current: MathOperation[],
  operation: MathOperation,
): MathOperation[] {
  return current.includes(operation)
    ? current.filter((value) => value !== operation)
    : [...current, operation];
}

export function OperationSelector({
  selected,
  onChange,
}: OperationSelectorProps) {
  const allSelected = ALL_MATH_OPERATIONS.every((operation) =>
    selected.includes(operation),
  );

  return (
    <fieldset className="selector-group">
      <legend className="selector-group__legend">Operations</legend>
      <p className="selector-group__hint">
        Pick one or more. Choose all four for mixed practice!
      </p>
      <div className="selector-group__toolbar">
        <button
          type="button"
          className="selector-group__shortcut"
          aria-pressed={allSelected}
          onClick={() => onChange([...ALL_MATH_OPERATIONS])}
        >
          Select All Operations
        </button>
      </div>
      <div
        className="selector-group__options"
        role="group"
        aria-label="Operations"
      >
        {OPERATION_OPTIONS.map(({ value, label, symbol }) => {
          const isSelected = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              className={
                isSelected
                  ? 'selector-group__option selector-group__option--selected'
                  : 'selector-group__option'
              }
              aria-pressed={isSelected}
              onClick={() => onChange(toggleOperation(selected, value))}
            >
              <span
                className="selector-group__option-symbol"
                aria-hidden="true"
              >
                {symbol}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
