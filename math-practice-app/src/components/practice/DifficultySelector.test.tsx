import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DifficultySelector } from './DifficultySelector';

describe('DifficultySelector', () => {
  it('renders four labeled difficulty options with descriptions', () => {
    render(<DifficultySelector selected={2} onChange={() => {}} />);

    expect(
      screen.getByRole('radio', { name: /beginner/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /easy/i })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /intermediate/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /advanced/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/small numbers/i)).toBeInTheDocument();
  });

  it('calls onChange when a new level is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DifficultySelector selected={2} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: /advanced/i }));

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
