import type { AppStatistics } from '../../types/statistics';
import { OPERATION_OPTIONS } from '../../constants/practiceSetup';
import { StatisticsCard } from './StatisticsCard';
import './StatisticsSection.css';

export interface OperationStatisticsSectionProps {
  statistics: AppStatistics;
}

export function OperationStatisticsSection({
  statistics,
}: OperationStatisticsSectionProps) {
  return (
    <section
      className="statistics-section"
      aria-labelledby="operation-statistics-title"
    >
      <h2 id="operation-statistics-title" className="statistics-section__title">
        By Operation
      </h2>
      <div className="statistics-section__grid">
        {OPERATION_OPTIONS.map((option) => (
          <StatisticsCard
            key={option.value}
            title={option.label}
            subtitle={option.symbol}
            stats={statistics.byOperation[option.value]}
          />
        ))}
      </div>
    </section>
  );
}
