import { describe, expect, it } from 'vitest';
import { getMultiplicationConstraints } from '../difficultyRules';
import { generateMultiplicationQuestion } from './multiplication';
import { validateQuestion } from '../../utils/validation';

describe('generateMultiplicationQuestion', () => {
  it('returns a valid multiplication question', () => {
    const question = generateMultiplicationQuestion(2);

    expect(question.operation).toBe('multiplication');
    expect(question.correctAnswer).toBe(
      question.firstOperand * question.secondOperand,
    );
    expect(validateQuestion(question, 2)).toBe(true);
  });

  it('keeps factors within each difficulty range', () => {
    const levels = [1, 2, 3, 4] as const;

    for (const level of levels) {
      const rules = getMultiplicationConstraints(level);

      for (let index = 0; index < 20; index += 1) {
        const question = generateMultiplicationQuestion(level);
        expect(validateQuestion(question, level)).toBe(true);

        if (level === 1 || level === 2) {
          const range = rules.factorRanges[0];
          expect(question.firstOperand).toBeGreaterThanOrEqual(range.min);
          expect(question.firstOperand).toBeLessThanOrEqual(range.max);
          expect(question.secondOperand).toBeGreaterThanOrEqual(range.min);
          expect(question.secondOperand).toBeLessThanOrEqual(range.max);
        }
      }
    }
  });
});
