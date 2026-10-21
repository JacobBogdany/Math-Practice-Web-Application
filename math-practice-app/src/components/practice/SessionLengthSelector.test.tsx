import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SessionLengthSelector } from './SessionLengthSelector';

describe('SessionLengthSelector', () => {
  it('renders all session length options', () => {
    render(<SessionLengthSelector selected={10} onChange={() => {}} />);

    expect(
      screen.getByRole('radio', { name: /5 questions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /10 questions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /20 questions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /continuous practice/i }),
    ).toBeInTheDocument();
  });

  it('defaults selection to the provided value', () => {
    render(<SessionLengthSelector selected={10} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: /10 questions/i })).toBeChecked();
  });

  it('calls onChange when a new length is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SessionLengthSelector selected={10} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: /20 questions/i }));

    expect(onChange).toHaveBeenCalledWith(20);
  });
});
