import { describe, expect, it } from 'vitest';
import type { MistakePattern } from '../types';
import {
  generateFactFamilyQuestion,
  generateNearbyQuestion,
  generateReversedQuestion,
  generateSimilarQuestion,
  getAvailableStrategies,
} from './similarQuestionGenerator';

const additionPattern: MistakePattern = {
  id: 'mistake-add-8-7-2',
  operation: 'addition',
  firstOperand: 8,
  secondOperand: 7,
  correctAnswer: 15,
  difficulty: 2,
  incorrectCount: 2,
  similarCorrectCount: 0,
  lastIncorrectAt: '2026-01-01T00:00:00.000Z',
  mastered: false,
};

const subtractionPattern: MistakePattern = {
  id: 'mistake-sub-15-7-2',
  operation: 'subtraction',
  firstOperand: 15,
  secondOperand: 7,
  correctAnswer: 8,
  difficulty: 2,
  incorrectCount: 1,
  similarCorrectCount: 0,
  lastIncorrectAt: '2026-01-01T00:00:00.000Z',
  mastered: false,
};

const multiplicationPattern: MistakePattern = {
  id: 'mistake-mul-8-7-2',
  operation: 'multiplication',
  firstOperand: 8,
  secondOperand: 7,
  correctAnswer: 56,
  difficulty: 2,
  incorrectCount: 3,
  similarCorrectCount: 1,
  lastIncorrectAt: '2026-01-01T00:00:00.000Z',
  mastered: false,
};

const divisionPattern: MistakePattern = {
  id: 'mistake-div-56-7-2',
  operation: 'division',
  firstOperand: 56,
  secondOperand: 7,
  correctAnswer: 8,
  difficulty: 2,
  incorrectCount: 2,
  similarCorrectCount: 0,
  lastIncorrectAt: '2026-01-01T00:00:00.000Z',
  mastered: false,
};

describe('similarQuestionGenerator', () => {
  describe('getAvailableStrategies', () => {
    it('includes reversed for asymmetric addition and multiplication', () => {
      expect(getAvailableStrategies(additionPattern)).toContain('reversed');
      expect(getAvailableStrategies(multiplicationPattern)).toContain(
        'reversed',
      );
    });

    it('excludes reversed for subtraction, division, and equal operands', () => {
      expect(getAvailableStrategies(subtractionPattern)).not.toContain(
        'reversed',
      );
      expect(getAvailableStrategies(divisionPattern)).not.toContain('reversed');
      expect(
        getAvailableStrategies({ ...additionPattern, secondOperand: 8 }),
      ).not.toContain('reversed');
    });
  });

  describe('generateReversedQuestion', () => {
    it('reverses addition operands', () => {
      const question = generateReversedQuestion(additionPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('addition');
      expect(question?.firstOperand).toBe(7);
      expect(question?.secondOperand).toBe(8);
      expect(question?.correctAnswer).toBe(15);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(additionPattern.id);
    });

    it('reverses multiplication operands', () => {
      const question = generateReversedQuestion(multiplicationPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('multiplication');
      expect(question?.firstOperand).toBe(7);
      expect(question?.secondOperand).toBe(8);
      expect(question?.correctAnswer).toBe(56);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(multiplicationPattern.id);
    });

    it('returns null for subtraction and division', () => {
      expect(generateReversedQuestion(subtractionPattern)).toBeNull();
      expect(generateReversedQuestion(divisionPattern)).toBeNull();
    });
  });

  describe('generateFactFamilyQuestion', () => {
    it('generates subtraction from addition mistake', () => {
      const question = generateFactFamilyQuestion(additionPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('subtraction');
      expect(question?.firstOperand).toBe(15);
      expect([7, 8]).toContain(question?.secondOperand);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(additionPattern.id);
    });

    it('generates addition from subtraction mistake', () => {
      const question = generateFactFamilyQuestion(subtractionPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('addition');
      expect(question?.correctAnswer).toBe(15);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(subtractionPattern.id);
    });

    it('generates division from multiplication mistake', () => {
      const question = generateFactFamilyQuestion(multiplicationPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('division');
      expect(question?.firstOperand).toBe(56);
      expect([7, 8]).toContain(question?.secondOperand);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(multiplicationPattern.id);
    });

    it('generates multiplication from division mistake', () => {
      const question = generateFactFamilyQuestion(divisionPattern);
      expect(question).not.toBeNull();
      expect(question?.operation).toBe('multiplication');
      expect(question?.correctAnswer).toBe(56);
      expect(question?.source).toBe('mistake-review');
      expect(question?.mistakePatternId).toBe(divisionPattern.id);
    });
  });

  describe('generateNearbyQuestion', () => {
    it('generates valid nearby questions for each operation', () => {
      const addQ = generateNearbyQuestion(additionPattern);
      expect(addQ.operation).toBe('addition');
      expect(addQ.source).toBe('mistake-review');
      expect(addQ.choices).toHaveLength(4);
      expect(addQ.choices).toContain(addQ.correctAnswer);

      const subQ = generateNearbyQuestion(subtractionPattern);
      expect(subQ.operation).toBe('subtraction');
      expect(subQ.source).toBe('mistake-review');
      expect(subQ.firstOperand).toBeGreaterThanOrEqual(subQ.secondOperand);

      const mulQ = generateNearbyQuestion(multiplicationPattern);
      expect(mulQ.operation).toBe('multiplication');
      expect(mulQ.source).toBe('mistake-review');

      const divQ = generateNearbyQuestion(divisionPattern);
      expect(divQ.operation).toBe('division');
      expect(divQ.secondOperand).toBeGreaterThan(0);
      expect(divQ.firstOperand % divQ.secondOperand).toBe(0);
      expect(divQ.source).toBe('mistake-review');
    });
  });

  describe('generateSimilarQuestion', () => {
    it('generates a valid question with preferred strategy', () => {
      const q = generateSimilarQuestion(additionPattern, 'reversed');
      expect(q.firstOperand).toBe(7);
      expect(q.secondOperand).toBe(8);
      expect(q.source).toBe('mistake-review');
      expect(q.mistakePatternId).toBe(additionPattern.id);
    });

    it('generates valid questions across all 4 operations', () => {
      for (const pattern of [
        additionPattern,
        subtractionPattern,
        multiplicationPattern,
        divisionPattern,
      ]) {
        const q = generateSimilarQuestion(pattern);
        expect(q.source).toBe('mistake-review');
        expect(q.mistakePatternId).toBe(pattern.id);
        expect(q.choices).toHaveLength(4);
        expect(q.choices).toContain(q.correctAnswer);
      }
    });
  });
});
