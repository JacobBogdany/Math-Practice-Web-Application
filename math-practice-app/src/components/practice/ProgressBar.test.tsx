import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders an accessible progress bar', () => {
    render(<ProgressBar completed={3} total={10} label="3 of 10 completed" />);

    const progressBar = screen.getByRole('progressbar', {
      name: /session progress: 3 of 10 questions completed/i,
    });

    expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    expect(screen.getByText('3 of 10 completed')).toBeInTheDocument();
  });
});
