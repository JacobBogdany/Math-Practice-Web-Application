import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppTitle } from './AppTitle';

describe('AppTitle', () => {
  it('renders the default application title', () => {
    render(<AppTitle />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Math Practice',
    );
  });

  it('renders a custom title when provided', () => {
    render(<AppTitle title="Custom Title" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Custom Title',
    );
  });
});
