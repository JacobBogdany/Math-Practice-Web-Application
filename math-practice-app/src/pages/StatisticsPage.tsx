import { ButtonLink } from '../components/common/ButtonLink';
import { PageCard } from '../components/common/PageCard';

export function StatisticsPage() {
  return (
    <PageCard
      title="Statistics"
      message="Track your progress by operation, difficulty, and recent sessions."
      actions={
        <ButtonLink to="/" variant="grape">
          Back to Home
        </ButtonLink>
      }
    />
  );
}
