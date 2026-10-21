import { describe, expect, it } from 'vitest';
import {
  collectDistractorCandidatesForTest,
  generateChoices,
  generateDistractors,
  MAX_DISTRACTOR_ATTEMPTS,
} from './distractorGenerator';

function assertChoiceRules(
  choices: number[],
  correctAnswer: number,
  allowNegative: boolean,
) {
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === correctAnswer)).toHaveLength(1);
  choices.forEach((choice) => {
    expect(Number.isInteger(choice)).toBe(true);
    if (!allowNegative) {
      expect(choice).toBeGreaterThanOrEqual(0);
    }
  });
}

describe('distractorGenerator', () => {
  it('generates three unique incorrect distractors', () => {
    const distractors = generateDistractors({
      operation: 'addition',
      firstOperand: 7,
      secondOperand: 8,
      correctAnswer: 15,
      allowNegativeChoices: false,
    });

    expect(distractors).toHaveLength(3);
    expect(new Set(distractors).size).toBe(3);
    expect(distractors).not.toContain(15);
  });

  it('builds four shuffled choices with the correct answer exactly once', () => {
    const choices = generateChoices({
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      allowNegativeChoices: false,
    });

    assertChoiceRules(choices, 56, false);
  });

  it('avoids negative choices when they are not allowed', () => {
    const choices = generateChoices({
      operation: 'subtraction',
      firstOperand: 10,
      secondOperand: 3,
      correctAnswer: 7,
      allowNegativeChoices: false,
    });

    assertChoiceRules(choices, 7, false);
    choices.forEach((choice) => expect(choice).toBeGreaterThanOrEqual(0));
  });

  it('includes operation-specific addition mistake distractors', () => {
    const candidates = collectDistractorCandidatesForTest({
      operation: 'addition',
      firstOperand: 7,
      secondOperand: 8,
      correctAnswer: 15,
      allowNegativeChoices: false,
    });

    expect(candidates).toContain(16);
    expect(candidates).toContain(14);
  });

  it('includes operation-specific subtraction mistake distractors', () => {
    const candidates = collectDistractorCandidatesForTest({
      operation: 'subtraction',
      firstOperand: 12,
      secondOperand: 5,
      correctAnswer: 7,
      allowNegativeChoices: false,
    });

    expect(candidates).toContain(17);
    expect(candidates).toContain(6);
  });

  it('includes multiplication-table distractors', () => {
    const candidates = collectDistractorCandidatesForTest({
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      allowNegativeChoices: false,
    });

    expect(candidates).toContain(48);
    expect(candidates).toContain(64);
  });

  it('includes division fact-family distractors', () => {
    const candidates = collectDistractorCandidatesForTest({
      operation: 'division',
      firstOperand: 56,
      secondOperand: 7,
      correctAnswer: 8,
      allowNegativeChoices: false,
    });

    expect(candidates).toContain(7);
    expect(candidates).toContain(9);
  });

  it('handles answers near zero', () => {
    const cases = [
      {
        operation: 'addition' as const,
        firstOperand: 0,
        secondOperand: 2,
        correctAnswer: 2,
      },
      {
        operation: 'subtraction' as const,
        firstOperand: 5,
        secondOperand: 5,
        correctAnswer: 0,
      },
      {
        operation: 'multiplication' as const,
        firstOperand: 0,
        secondOperand: 9,
        correctAnswer: 0,
      },
      {
        operation: 'division' as const,
        firstOperand: 0,
        secondOperand: 4,
        correctAnswer: 0,
      },
    ];

    for (const testCase of cases) {
      const choices = generateChoices({
        ...testCase,
        allowNegativeChoices: false,
      });
      assertChoiceRules(choices, testCase.correctAnswer, false);
    }
  });

  it('does not leave the correct answer in a predictable position', () => {
    const firstPositions = Array.from({ length: 40 }, () => {
      const choices = generateChoices({
        operation: 'addition',
        firstOperand: 9,
        secondOperand: 6,
        correctAnswer: 15,
        allowNegativeChoices: false,
      });

      return choices.indexOf(15);
    });

    expect(new Set(firstPositions).size).toBeGreaterThan(1);
  });

  it('defines a retry limit for distractor generation', () => {
    expect(MAX_DISTRACTOR_ATTEMPTS).toBeGreaterThan(0);
  });
});
