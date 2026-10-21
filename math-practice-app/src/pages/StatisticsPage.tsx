import { useState } from 'react';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DifficultyStatisticsSection } from '../components/statistics/DifficultyStatisticsSection';
import { OperationStatisticsSection } from '../components/statistics/OperationStatisticsSection';
import { RecentSessionsList } from '../components/statistics/RecentSessionsList';
import { StatisticsOverview } from '../components/statistics/StatisticsOverview';
import { useStatistics } from '../hooks/useStatistics';
import './StatisticsPage.css';

export function StatisticsPage() {
  const { statistics, sessions, hasAttempts, resetStatistics } =
    useStatistics();
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
          See how you are doing overall, by operation, by difficulty, and across
          recent sessions.
        </p>
      </section>

      <StatisticsOverview statistics={statistics} />
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
          disabled={!hasAttempts}
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
