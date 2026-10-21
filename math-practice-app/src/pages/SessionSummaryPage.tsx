import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import {
  formatDifficulty,
  formatOperations,
  formatSessionLength,
} from '../constants/practiceSetup';
import {
  calculateAccuracy,
  countMistakeReviewAttempts,
  isValidSessionSummaryState,
  sessionToPracticeSetup,
} from '../types';
import './SessionSummaryPage.css';

export function SessionSummaryPage() {
  const location = useLocation();
  const summaryState = location.state;

  if (!isValidSessionSummaryState(summaryState)) {
    return <Navigate to="/" replace />;
  }

  const { session, attempts } = summaryState;
  const accuracy = calculateAccuracy(session.correct, session.attempted);
  const mistakeReviewCount = countMistakeReviewAttempts(attempts);
  const practiceAgainConfig = sessionToPracticeSetup(session);

  return (
    <div className="session-summary">
      <section
        className="session-summary__card"
        aria-labelledby="summary-title"
      >
        <h1 id="summary-title" className="session-summary__title">
          Session Complete!
        </h1>
        <ul className="session-summary__stats">
          <li className="session-summary__stat">
            <span className="session-summary__stat-label">Attempted</span>
            <span className="session-summary__stat-value">
              {session.attempted}
            </span>
          </li>
          <li className="session-summary__stat">
            <span className="session-summary__stat-label">Correct</span>
            <span className="session-summary__stat-value">
              {session.correct}
            </span>
          </li>
          <li className="session-summary__stat">
            <span className="session-summary__stat-label">Incorrect</span>
            <span className="session-summary__stat-value">
              {session.incorrect}
            </span>
          </li>
          <li className="session-summary__stat">
            <span className="session-summary__stat-label">Accuracy</span>
            <span className="session-summary__stat-value">{accuracy}%</span>
          </li>
          <li className="session-summary__stat session-summary__stat--wide">
            <span className="session-summary__stat-label">Mistake Review</span>
            <span className="session-summary__stat-value">
              {mistakeReviewCount}
            </span>
          </li>
        </ul>
        <dl className="session-summary__details">
          <div className="session-summary__detail">
            <dt>Operations</dt>
            <dd>{formatOperations(session.operations)}</dd>
          </div>
          <div className="session-summary__detail">
            <dt>Difficulty</dt>
            <dd>{formatDifficulty(session.difficulty)}</dd>
          </div>
          <div className="session-summary__detail">
            <dt>Session Length</dt>
            <dd>
              {session.sessionLength === 'continuous'
                ? 'Continuous practice'
                : formatSessionLength(session.sessionLength)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="session-summary__actions">
        <ButtonLink
          to="/practice/session"
          state={practiceAgainConfig}
          variant="sky"
          icon="▶"
          block
        >
          Practice Again
        </ButtonLink>
        <div className="session-summary__disabled-action">
          <Button
            variant="coral"
            block
            disabled
            aria-describedby="mistake-review-help"
          >
            Practice Mistakes
          </Button>
          <p id="mistake-review-help" className="session-summary__help">
            No saved mistakes are available to review yet.
          </p>
        </div>
        <ButtonLink to="/practice/setup" variant="sun" block>
          Change Settings
        </ButtonLink>
        <ButtonLink to="/statistics" variant="grape" icon="★" block>
          View Statistics
        </ButtonLink>
        <ButtonLink to="/" variant="grape" block>
          Return Home
        </ButtonLink>
      </div>
    </div>
  );
}
