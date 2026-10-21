import { Link } from 'react-router-dom';
import './Header.css';

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__link">
        <span className="app-header__logo" aria-hidden="true">
          +
        </span>
        <span className="app-header__title">Math Practice</span>
      </Link>
    </header>
  );
}
