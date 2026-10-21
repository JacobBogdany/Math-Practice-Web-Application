import { describe, expect, it } from 'vitest';
import { getDivisionConstraints } from '../difficultyRules';
import { generateDivisionQuestion } from './division';
import { validateQuestion } from '../../utils/validation';

describe('generateDivisionQuestion', () => {
  it('returns a valid division question', () => {
    const question = generateDivisionQuestion(2);

    expect(question.operation).toBe('division');
    expect(question.secondOperand).not.toBe(0);
    expect(question.firstOperand).toBe(
      question.secondOperand * question.correctAnswer,
    );
    expect(Number.isInteger(question.correctAnswer)).toBe(true);
    expect(validateQuestion(question, 2)).toBe(true);
  });

  it('never divides by zero', () => {
    for (let index = 0; index < 40; index += 1) {
      const question = generateDivisionQuestion(4);
      expect(question.secondOperand).not.toBe(0);
    }
  });

  it('respects intermediate dividend limits', () => {
    const rules = getDivisionConstraints(3);

    for (let index = 0; index < 30; index += 1) {
      const question = generateDivisionQuestion(3);
      expect(question.firstOperand).toBeLessThanOrEqual(rules.maxDividend!);
    }
  });
});
