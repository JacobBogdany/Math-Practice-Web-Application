import type { AppStatistics } from '../../types/statistics';
import { calculateOverallAccuracy } from '../../services/statisticsService';
import './StatisticsOverview.css';

export interface StatisticsOverviewProps {
  statistics: AppStatistics;
}

export function StatisticsOverview({ statistics }: StatisticsOverviewProps) {
  const accuracy = calculateOverallAccuracy(statistics);
  const isEmpty = statistics.attempted === 0;

  return (
    <section
      className="statistics-overview"
      aria-labelledby="statistics-overview-title"
    >
      <h2 id="statistics-overview-title" className="statistics-overview__title">
        Overall Performance
      </h2>
      {isEmpty ? (
        <p className="statistics-overview__empty">
          No practice questions yet. Complete a session to start tracking your
          progress!
        </p>
      ) : null}
      <ul className="statistics-overview__stats">
        <li className="statistics-overview__stat">
          <span className="statistics-overview__stat-label">Attempted</span>
          <span className="statistics-overview__stat-value">
            {statistics.attempted}
          </span>
        </li>
        <li className="statistics-overview__stat">
          <span className="statistics-overview__stat-label">Correct</span>
          <span className="statistics-overview__stat-value">
            {statistics.correct}
          </span>
        </li>
        <li className="statistics-overview__stat">
          <span className="statistics-overview__stat-label">Incorrect</span>
          <span className="statistics-overview__stat-value">
            {statistics.incorrect}
          </span>
        </li>
        <li className="statistics-overview__stat">
          <span className="statistics-overview__stat-label">Accuracy</span>
          <span className="statistics-overview__stat-value">{accuracy}%</span>
        </li>
      </ul>
    </section>
  );
}
