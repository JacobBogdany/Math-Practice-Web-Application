import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('shows a welcome message', () => {
    renderHomePage();
    expect(
      screen.getByRole('heading', { name: /ready to become a math star/i }),
    ).toBeInTheDocument();
  });

  it('links main action buttons to the correct routes', () => {
    renderHomePage();

    expect(
      screen.getByRole('link', { name: /start practice/i }),
    ).toHaveAttribute('href', '/practice/setup');
    expect(
      screen.getByRole('link', { name: /view statistics/i }),
    ).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/settings',
    );
  });
});
