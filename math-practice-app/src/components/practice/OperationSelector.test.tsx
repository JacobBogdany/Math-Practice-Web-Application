import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OperationSelector } from './OperationSelector';

describe('OperationSelector', () => {
  it('renders all four operations', () => {
    render(<OperationSelector selected={[]} onChange={() => {}} />);

    expect(
      screen.getByRole('button', { name: /addition/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /subtraction/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /multiplication/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /division/i }),
    ).toBeInTheDocument();
  });

  it('toggles an operation on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<OperationSelector selected={[]} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /addition/i }));

    expect(onChange).toHaveBeenCalledWith(['addition']);
  });

  it('selects all operations with the shortcut', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<OperationSelector selected={['addition']} onChange={onChange} />);
    await user.click(
      screen.getByRole('button', { name: /select all operations/i }),
    );

    expect(onChange).toHaveBeenCalledWith([
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ]);
  });

  it('marks selected operations with aria-pressed', () => {
    render(
      <OperationSelector selected={['multiplication']} onChange={() => {}} />,
    );

    expect(
      screen.getByRole('button', { name: /multiplication/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /addition/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
