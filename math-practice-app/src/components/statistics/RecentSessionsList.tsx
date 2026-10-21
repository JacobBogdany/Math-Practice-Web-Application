import type { PracticeSession } from '../../types';
import { calculateAccuracy } from '../../types';
import {
  formatDifficulty,
  formatOperations,
} from '../../constants/practiceSetup';
import './RecentSessionsList.css';

export interface RecentSessionsListProps {
  sessions: PracticeSession[];
}

function formatSessionDate(session: PracticeSession): string {
  const dateValue = session.completedAt ?? session.startedAt;
  return new Date(dateValue).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  return (
    <section
      className="recent-sessions"
      aria-labelledby="recent-sessions-title"
    >
      <h2 id="recent-sessions-title" className="recent-sessions__title">
        Recent Sessions
      </h2>
      {sessions.length === 0 ? (
        <p className="recent-sessions__empty">
          No completed sessions yet. Finish a practice session to see it here.
        </p>
      ) : (
        <ul className="recent-sessions__list">
          {sessions.map((session) => {
            const accuracy = calculateAccuracy(
              session.correct,
              session.attempted,
            );

            return (
              <li key={session.id} className="recent-sessions__item">
                <div className="recent-sessions__header">
                  <h3 className="recent-sessions__date">
                    {formatSessionDate(session)}
                  </h3>
                  <span className="recent-sessions__accuracy">
                    {accuracy}% accuracy
                  </span>
                </div>
                <p className="recent-sessions__details">
                  {formatOperations(session.operations)} ·{' '}
                  {formatDifficulty(session.difficulty)}
                </p>
                <dl className="recent-sessions__stats">
                  <div>
                    <dt>Attempted</dt>
                    <dd>{session.attempted}</dd>
                  </div>
                  <div>
                    <dt>Correct</dt>
                    <dd>{session.correct}</dd>
                  </div>
                  <div>
                    <dt>Incorrect</dt>
                    <dd>{session.incorrect}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
