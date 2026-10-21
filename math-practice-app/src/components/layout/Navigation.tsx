import { NavLink } from 'react-router-dom';
import './Navigation.css';

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/practice/setup', label: 'Practice' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/settings', label: 'Settings' },
];

export function Navigation() {
  return (
    <nav className="app-nav" aria-label="Site navigation">
      <ul className="app-nav__list">
        {NAV_ITEMS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive
                  ? 'app-nav__link app-nav__link--active'
                  : 'app-nav__link'
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
