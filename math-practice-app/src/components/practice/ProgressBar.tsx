import './ProgressBar.css';

export interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.min(100, Math.round((completed / safeTotal) * 100));

  return (
    <div className="progress-bar">
      {label ? <p className="progress-bar__label">{label}</p> : null}
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        aria-label={`Session progress: ${completed} of ${total} questions completed`}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
