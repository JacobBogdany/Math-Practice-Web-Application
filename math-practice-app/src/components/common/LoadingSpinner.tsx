import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({
  label = 'Loading, please wait...',
}: LoadingSpinnerProps) {
  return (
    <div
      className="loading-spinner-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-spinner" aria-hidden="true" />
      <span className="loading-spinner__label">{label}</span>
    </div>
  );
}

