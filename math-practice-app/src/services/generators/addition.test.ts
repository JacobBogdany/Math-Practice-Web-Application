import { describe, expect, it } from 'vitest';
import { getAdditionConstraints } from '../difficultyRules';
import { generateAdditionQuestion } from './addition';
import { validateQuestion } from '../../utils/validation';

describe('generateAdditionQuestion', () => {
  it('returns a valid addition question', () => {
    const question = generateAdditionQuestion(2);

    expect(question.operation).toBe('addition');
    expect(question.displayText).toMatch(/\+/);
    expect(question.correctAnswer).toBe(
      question.firstOperand + question.secondOperand,
    );
    expect(validateQuestion(question, 2)).toBe(true);
  });

  it('respects beginner operand and sum limits', () => {
    const rules = getAdditionConstraints(1);

    for (let index = 0; index < 30; index += 1) {
      const question = generateAdditionQuestion(1);

      expect(question.firstOperand).toBeGreaterThanOrEqual(rules.operandMin);
      expect(question.firstOperand).toBeLessThanOrEqual(rules.operandMax);
      expect(question.secondOperand).toBeGreaterThanOrEqual(rules.operandMin);
      expect(question.secondOperand).toBeLessThanOrEqual(rules.operandMax);
      expect(question.correctAnswer).toBeLessThanOrEqual(rules.maxSum!);
    }
  });
});
