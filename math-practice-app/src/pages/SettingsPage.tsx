import { ButtonLink } from '../components/common/ButtonLink';
import { PageCard } from '../components/common/PageCard';

export function SettingsPage() {
  return (
    <PageCard
      title="Settings"
      message="Adjust sound, animations, defaults, and other preferences here."
      actions={
        <ButtonLink to="/" variant="grape">
          Back to Home
        </ButtonLink>
      }
    />
  );
}
