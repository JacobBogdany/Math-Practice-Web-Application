import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Navigation } from './Navigation';

function renderNavigation(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navigation />
    </MemoryRouter>,
  );
}

describe('Navigation', () => {
  it('renders links to all main sections', () => {
    renderNavigation();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute(
      'href',
      '/practice/setup',
    );
    expect(screen.getByRole('link', { name: 'Statistics' })).toHaveAttribute(
      'href',
      '/statistics',
    );
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('marks the active route', () => {
    renderNavigation('/statistics');
    expect(screen.getByRole('link', { name: 'Statistics' })).toHaveClass(
      'app-nav__link--active',
    );
  });
});
