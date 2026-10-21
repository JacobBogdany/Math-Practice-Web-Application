import type { MistakeSummaryStatistics } from '../../types/statistics';
import { OPERATION_OPTIONS } from '../../constants/practiceSetup';
import './MistakeStatisticsSection.css';

export interface MistakeStatisticsSectionProps {
  mistakeStatistics: MistakeSummaryStatistics;
}

export function MistakeStatisticsSection({
  mistakeStatistics,
}: MistakeStatisticsSectionProps) {
  const {
    activePatternsCount,
    masteredPatternsCount,
    similarPracticedCount,
    reviewCorrectCount,
    mostMissedOperation,
    mostMissedFacts,
  } = mistakeStatistics;

  const operationLabel = mostMissedOperation
    ? (OPERATION_OPTIONS.find((op) => op.value === mostMissedOperation)
        ?.label ?? mostMissedOperation)
    : 'None';

  const hasMistakes = activePatternsCount > 0 || masteredPatternsCount > 0;

  return (
    <section
      className="mistake-statistics"
      aria-labelledby="mistake-statistics-title"
    >
      <h2 id="mistake-statistics-title" className="mistake-statistics__title">
        Mistake & Review Analytics
      </h2>

      <ul className="mistake-statistics__grid">
        <li className="mistake-statistics__card">
          <span className="mistake-statistics__card-label">
            Active Mistakes
          </span>
          <span className="mistake-statistics__card-value">
            {activePatternsCount}
          </span>
        </li>
        <li className="mistake-statistics__card">
          <span className="mistake-statistics__card-label">
            Mastered Patterns
          </span>
          <span className="mistake-statistics__card-value">
            {masteredPatternsCount}
          </span>
        </li>
        <li className="mistake-statistics__card">
          <span className="mistake-statistics__card-label">
            Similar Practiced
          </span>
          <span className="mistake-statistics__card-value">
            {similarPracticedCount}
          </span>
        </li>
        <li className="mistake-statistics__card">
          <span className="mistake-statistics__card-label">Review Correct</span>
          <span className="mistake-statistics__card-value">
            {reviewCorrectCount}
          </span>
        </li>
      </ul>

      <div className="mistake-statistics__areas">
        <div className="mistake-statistics__area-card">
          <h3 className="mistake-statistics__subheading">
            Most Missed Operation
          </h3>
          <p className="mistake-statistics__highlight">
            {hasMistakes ? operationLabel : 'No missed operations yet'}
          </p>
        </div>

        <div className="mistake-statistics__area-card">
          <h3 className="mistake-statistics__subheading">
            Frequently Missed Facts
          </h3>
          {mostMissedFacts.length > 0 ? (
            <ul className="mistake-statistics__facts-list">
              {mostMissedFacts.map((fact) => (
                <li
                  key={fact.patternId}
                  className="mistake-statistics__fact-item"
                >
                  <span className="mistake-statistics__fact-text">
                    {fact.factText}
                  </span>
                  <span className="mistake-statistics__fact-badge">
                    {fact.incorrectCount} missed
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mistake-statistics__empty-hint">
              No recurring mistake facts recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
