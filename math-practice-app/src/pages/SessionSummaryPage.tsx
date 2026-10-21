import { ButtonLink } from '../components/common/ButtonLink';
import { PageCard } from '../components/common/PageCard';

export function SessionSummaryPage() {
  return (
    <PageCard
      title="Session Summary"
      message="After you finish a session, your results and accuracy will show up here."
      actions={
        <>
          <ButtonLink to="/practice/setup" variant="sky">
            Practice Again
          </ButtonLink>
          <ButtonLink to="/" variant="grape">
            Home
          </ButtonLink>
        </>
      }
    />
  );
}
