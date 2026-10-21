import type { AppStatistics } from '../../types/statistics';
import { DIFFICULTY_OPTIONS } from '../../constants/practiceSetup';
import { StatisticsCard } from './StatisticsCard';
import './StatisticsSection.css';

export interface DifficultyStatisticsSectionProps {
  statistics: AppStatistics;
}

export function DifficultyStatisticsSection({
  statistics,
}: DifficultyStatisticsSectionProps) {
  return (
    <section
      className="statistics-section"
      aria-labelledby="difficulty-statistics-title"
    >
      <h2
        id="difficulty-statistics-title"
        className="statistics-section__title"
      >
        By Difficulty
      </h2>
      <div className="statistics-section__grid">
        {DIFFICULTY_OPTIONS.map((option) => (
          <StatisticsCard
            key={option.value}
            title={`Level ${option.value}: ${option.label}`}
            subtitle={option.description}
            stats={statistics.byDifficulty[option.value]}
          />
        ))}
      </div>
    </section>
  );
}

