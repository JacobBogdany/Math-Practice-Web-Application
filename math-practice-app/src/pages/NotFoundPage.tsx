import { ButtonLink } from '../components/common/ButtonLink';
import { PageCard } from '../components/common/PageCard';

export function NotFoundPage() {
  return (
    <PageCard
      title="Page Not Found"
      message="Oops! We couldn't find that page. Let's head back and keep practicing."
      actions={
        <ButtonLink to="/" variant="sky">
          Return Home
        </ButtonLink>
      }
    />
  );
}
