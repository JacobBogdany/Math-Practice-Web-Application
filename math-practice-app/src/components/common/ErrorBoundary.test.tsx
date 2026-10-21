import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash');
  }
  return <div>Normal Content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('renders fallback UI when an error is caught', () => {
    // Suppress console.error in vitest
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText(/something unexpected happened/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /go to home page/i }),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it('resets error state when Try Again is clicked', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;
    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText(/something unexpected happened/i),
    ).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText('Normal Content')).toBeInTheDocument();

    spy.mockRestore();
  });
});

