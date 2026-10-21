import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnswerChoice } from './AnswerChoice';

describe('AnswerChoice', () => {
  it('renders a labeled answer button', () => {
    render(
      <AnswerChoice
        value={56}
        choiceNumber={3}
        selected={false}
        disabled={false}
        onSelect={() => {}}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Answer choice 3: 56' }),
    ).toBeInTheDocument();
  });

  it('shows selected state and calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AnswerChoice
        value={48}
        choiceNumber={1}
        selected={false}
        disabled={false}
        onSelect={onSelect}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /answer choice 1: 48/i }),
    );
    expect(onSelect).toHaveBeenCalledWith(48);
  });

  it('does not allow selection when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AnswerChoice
        value={48}
        choiceNumber={1}
        selected={false}
        disabled
        onSelect={onSelect}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /answer choice 1: 48/i }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
