import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from './AppRoutes';

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('AppRoutes', () => {
  it('shows the home page at /', () => {
    renderApp('/');
    expect(
      screen.getByRole('heading', { name: /ready to become a math star/i }),
    ).toBeInTheDocument();
  });

  it('shows a fallback page for unknown routes', () => {
    renderApp('/does-not-exist');
    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
  });
});
