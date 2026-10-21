import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Question } from '../../types';
import { QuestionCard } from './QuestionCard';

const sampleQuestion: Question = {
  id: 'question-test-1',
  operation: 'multiplication',
  firstOperand: 7,
  secondOperand: 8,
  displayText: '7 × 8 = ?',
  correctAnswer: 56,
  choices: [48, 54, 56, 64],
  difficulty: 2,
  source: 'regular',
};

describe('QuestionCard', () => {
  it('shows the front of the card with progress and choices', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        questionNumber={3}
        totalQuestions={10}
        onResult={() => {}}
      />,
    );

    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument();
    expect(screen.getByText('7 × 8 = ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /flip card/i })).toBeDisabled();
  });

  it('allows answer selection and flipping', async () => {
    const user = userEvent.setup();

    render(
      <QuestionCard
        question={sampleQuestion}
        questionNumber={1}
        totalQuestions={5}
        cardAnimationEnabled={false}
        onResult={() => {}}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /answer choice 3: 56/i }),
    );
    expect(screen.getByRole('button', { name: /flip card/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /flip card/i }));
    expect(screen.getByText('7 × 8 = 56')).toBeInTheDocument();
    expect(screen.getByText('Your answer')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /answer choice 3: 56/i }),
    ).toBeDisabled();
  });

  it('records a self-reported result once and advances', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <QuestionCard
        question={sampleQuestion}
        questionNumber={1}
        totalQuestions={5}
        cardAnimationEnabled={false}
        onResult={onResult}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /answer choice 2: 54/i }),
    );
    await user.click(screen.getByRole('button', { name: /flip card/i }));
    await user.click(screen.getByRole('button', { name: /i got it right/i }));

    expect(onResult).toHaveBeenCalledWith(true, 54);
    expect(
      screen.getByRole('button', { name: /i got it wrong/i }),
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /i got it wrong/i }));
    expect(onResult).toHaveBeenCalledTimes(1);
  });
});
