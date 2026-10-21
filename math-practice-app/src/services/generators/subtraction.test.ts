import { describe, expect, it } from 'vitest';
import { generateSubtractionQuestion } from './subtraction';
import { validateQuestion } from '../../utils/validation';

describe('generateSubtractionQuestion', () => {
  it('returns a valid subtraction question', () => {
    const question = generateSubtractionQuestion(2);

    expect(question.operation).toBe('subtraction');
    expect(question.correctAnswer).toBe(
      question.firstOperand - question.secondOperand,
    );
    expect(validateQuestion(question, 2)).toBe(true);
  });

  it('avoids negative answers below advanced difficulty', () => {
    for (let index = 0; index < 30; index += 1) {
      const question = generateSubtractionQuestion(1);
      expect(question.firstOperand).toBeGreaterThanOrEqual(
        question.secondOperand,
      );
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
    }
  });

  it('allows negative answers at advanced difficulty', () => {
    const hasNegative = Array.from({ length: 40 }, () =>
      generateSubtractionQuestion(4),
    ).some((question) => question.correctAnswer < 0);

    expect(hasNegative).toBe(true);
  });
});
