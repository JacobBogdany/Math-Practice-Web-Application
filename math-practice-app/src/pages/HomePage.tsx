import { AppTitle } from '../components/common/AppTitle';
import { ButtonLink } from '../components/common/ButtonLink';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-page__hero" aria-labelledby="home-welcome">
        <AppTitle />
        <h2 id="home-welcome" className="home-page__welcome">
          Ready to become a math star?
        </h2>
        <p className="home-page__message">
          Practice addition, subtraction, multiplication, and division with fun
          flashcards. Flip the card, check your answer, and track your progress!
        </p>
      </section>

      <nav className="home-page__actions" aria-label="Main actions">
        <ButtonLink to="/practice/setup" variant="sky" icon="▶" block>
          Start Practice
        </ButtonLink>
        <ButtonLink to="/statistics" variant="sun" icon="★" block>
          View Statistics
        </ButtonLink>
        <ButtonLink to="/settings" variant="grape" icon="⚙" block>
          Settings
        </ButtonLink>
      </nav>

      <p className="home-page__hint">
        <strong>Tip:</strong> Pick your favorite operations and difficulty level
        to get started. You can always change them later!
      </p>
    </div>
  );
}
