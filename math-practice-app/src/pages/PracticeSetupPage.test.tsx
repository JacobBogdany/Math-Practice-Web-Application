import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PracticePage } from './PracticePage';
import { PracticeSetupPage } from './PracticeSetupPage';

function renderSetupPage() {
  return render(
    <MemoryRouter>
      <PracticeSetupPage />
    </MemoryRouter>,
  );
}

describe('PracticeSetupPage', () => {
  it('renders all setup selectors and a start button', () => {
    renderSetupPage();

    expect(
      screen.getByRole('heading', { name: /practice setup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /addition/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /easy/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /10 questions/i })).toBeChecked();
  });

  it('disables start when no operations are selected', async () => {
    const user = userEvent.setup();
    renderSetupPage();

    await user.click(
      screen.getByRole('button', { name: /select all operations/i }),
    );
    await user.click(screen.getByRole('button', { name: /addition/i }));
    await user.click(screen.getByRole('button', { name: /subtraction/i }));
    await user.click(screen.getByRole('button', { name: /multiplication/i }));
    await user.click(screen.getByRole('button', { name: /division/i }));

    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /please select at least one operation/i,
    );
  });
});

describe('Practice session flow', () => {
  it('passes setup configuration to the practice session page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/practice/setup']}>
        <Routes>
          <Route path="/practice/setup" element={<PracticeSetupPage />} />
          <Route path="/practice/session" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /addition/i }));
    await user.click(screen.getByRole('button', { name: /subtraction/i }));
    await user.click(screen.getByRole('button', { name: /division/i }));
    await user.click(screen.getByRole('radio', { name: /beginner/i }));
    await user.click(screen.getByRole('radio', { name: /5 questions/i }));
    await user.click(screen.getByRole('button', { name: /start session/i }));

    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /flip card/i }),
    ).toBeInTheDocument();
  });

  it('redirects to setup when session config is missing', () => {
    render(
      <MemoryRouter initialEntries={['/practice/session']}>
        <Routes>
          <Route path="/practice/setup" element={<PracticeSetupPage />} />
          <Route path="/practice/session" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /practice setup/i }),
    ).toBeInTheDocument();
  });
});
