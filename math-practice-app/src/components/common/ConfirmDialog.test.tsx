import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('shows a confirmation message with confirm and cancel actions', () => {
    render(
      <ConfirmDialog
        title="Leave practice session?"
        message="Your progress will be saved."
        confirmLabel="End Session"
        cancelLabel="Keep Practicing"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(
      screen.getByRole('heading', { name: /leave practice session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your progress will be saved/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /end session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /keep practicing/i }),
    ).toBeInTheDocument();
  });

  it('calls the appropriate handler when an action is chosen', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        title="End practice session?"
        message="Are you sure?"
        confirmLabel="End Session"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: /end session/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

