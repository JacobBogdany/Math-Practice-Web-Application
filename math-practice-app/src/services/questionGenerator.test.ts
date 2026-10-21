import { describe, expect, it } from 'vitest';
import {
  generateQuestion,
  generateQuestionFromOperations,
  generateQuestionsForAllOperations,
} from './questionGenerator';
import { validateQuestion } from '../utils/validation';

describe('questionGenerator', () => {
  it('generates a valid question for each operation and difficulty', () => {
    const operations = [
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ] as const;
    const levels = [1, 2, 3, 4] as const;

    for (const operation of operations) {
      for (const level of levels) {
        const question = generateQuestion(operation, level);
        expect(question.operation).toBe(operation);
        expect(question.difficulty).toBe(level);
        expect(validateQuestion(question, level)).toBe(true);
      }
    }
  });

  it('randomly selects from enabled operations', () => {
    const questions = Array.from({ length: 20 }, () =>
      generateQuestionFromOperations(['addition', 'multiplication'], 2),
    );

    expect(questions.every((question) => validateQuestion(question, 2))).toBe(
      true,
    );
    expect(
      questions.some((question) => question.operation === 'addition'),
    ).toBe(true);
    expect(
      questions.some((question) => question.operation === 'multiplication'),
    ).toBe(true);
  });

  it('throws when no operations are provided', () => {
    expect(() => generateQuestionFromOperations([], 2)).toThrow(
      /at least one operation/i,
    );
  });

  it('can generate one question per operation', () => {
    const questions = generateQuestionsForAllOperations(2);
    expect(Object.keys(questions)).toHaveLength(4);
    expect(validateQuestion(questions.addition, 2)).toBe(true);
    expect(validateQuestion(questions.division, 2)).toBe(true);
  });
});
