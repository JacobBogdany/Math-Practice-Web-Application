import type { OperationStatistics } from '../../types/statistics';
import { calculateOperationAccuracy } from '../../services/statisticsService';
import './StatisticsCard.css';

export interface StatisticsCardProps {
  title: string;
  stats: OperationStatistics;
  subtitle?: string;
}

export function StatisticsCard({
  title,
  stats,
  subtitle,
}: StatisticsCardProps) {
  const accuracy = calculateOperationAccuracy(stats);

  return (
    <article className="statistics-card" aria-label={`${title} statistics`}>
      <div className="statistics-card__header">
        <h3 className="statistics-card__title">{title}</h3>
        {subtitle ? (
          <p className="statistics-card__subtitle">{subtitle}</p>
        ) : null}
      </div>
      <dl className="statistics-card__metrics">
        <div className="statistics-card__metric">
          <dt>Attempted</dt>
          <dd>{stats.attempted}</dd>
        </div>
        <div className="statistics-card__metric">
          <dt>Correct</dt>
          <dd>{stats.correct}</dd>
        </div>
        <div className="statistics-card__metric">
          <dt>Incorrect</dt>
          <dd>{stats.incorrect}</dd>
        </div>
        <div className="statistics-card__metric statistics-card__metric--accent">
          <dt>Accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
      </dl>
    </article>
  );
}
