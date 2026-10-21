import { useState } from 'react';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DifficultyStatisticsSection } from '../components/statistics/DifficultyStatisticsSection';
import { MistakeDetailsSection } from '../components/statistics/MistakeDetailsSection';
import { MistakeStatisticsSection } from '../components/statistics/MistakeStatisticsSection';
import { OperationStatisticsSection } from '../components/statistics/OperationStatisticsSection';
import { RecentSessionsList } from '../components/statistics/RecentSessionsList';
import { StatisticsOverview } from '../components/statistics/StatisticsOverview';
import { useAppSettings } from '../context/useAppSettings';
import { useStatistics } from '../hooks/useStatistics';
import './StatisticsPage.css';

export function StatisticsPage() {
  const { settings } = useAppSettings();
  const {
    statistics,
    mistakeStatistics,
    mistakePatterns,
    sessions,
    hasAttempts,
    hasMistakes,
    resetStatistics,
  } = useStatistics();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="statistics-page">
      <section
        className="statistics-page__intro"
        aria-labelledby="statistics-title"
      >
        <h1 id="statistics-title" className="statistics-page__title">
          Statistics
        </h1>
        <p className="statistics-page__message">
          See how you are doing overall, by operation, by difficulty, across
          mistake reviews, and in recent sessions.
        </p>
      </section>

      <StatisticsOverview statistics={statistics} />
      <MistakeStatisticsSection mistakeStatistics={mistakeStatistics} />
      <MistakeDetailsSection
        patterns={mistakePatterns}
        masteryThreshold={settings.masteryThreshold}
      />
      <OperationStatisticsSection statistics={statistics} />
      <DifficultyStatisticsSection statistics={statistics} />
      <RecentSessionsList sessions={sessions} />

      <div className="statistics-page__actions">
        <ButtonLink to="/practice/setup" variant="sky" icon="▶" block>
          Start Practice
        </ButtonLink>
        <Button
          variant="coral"
          block
          disabled={!hasAttempts && !hasMistakes}
          onClick={() => setShowResetConfirm(true)}
        >
          Reset Statistics
        </Button>
        <p className="statistics-page__reset-note">
          Resetting clears practice history and statistics. Your settings stay
          the same.
        </p>
        <ButtonLink to="/" variant="grape" block>
          Back to Home
        </ButtonLink>
      </div>

      {showResetConfirm ? (
        <ConfirmDialog
          title="Reset statistics?"
          message="Are you sure you want to erase all practice history and statistics?"
          confirmLabel="Reset Statistics"
          cancelLabel="Keep My Progress"
          onConfirm={() => {
            setShowResetConfirm(false);
            resetStatistics();
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      ) : null}
    </div>
  );
}
