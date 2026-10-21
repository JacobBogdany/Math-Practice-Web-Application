import { describe, expect, it } from 'vitest';
import type { Question } from '../types';
import { getQuestionSignature, isSameQuestion } from './questionSignature';

const q1: Question = {
  id: 'q1',
  operation: 'addition',
  firstOperand: 3,
  secondOperand: 4,
  displayText: '3 + 4 = ?',
  correctAnswer: 7,
  choices: [5, 6, 7, 8],
  difficulty: 1,
  source: 'regular',
};

const q2: Question = {
  id: 'q2',
  operation: 'addition',
  firstOperand: 3,
  secondOperand: 4,
  displayText: '3 + 4 = ?',
  correctAnswer: 7,
  choices: [5, 6, 7, 8],
  difficulty: 1,
  source: 'regular',
};

const q3: Question = {
  id: 'q3',
  operation: 'multiplication',
  firstOperand: 3,
  secondOperand: 4,
  displayText: '3 × 4 = ?',
  correctAnswer: 12,
  choices: [10, 11, 12, 13],
  difficulty: 1,
  source: 'regular',
};

describe('questionSignature', () => {
  it('generates a consistent signature', () => {
    expect(getQuestionSignature(q1)).toBe('addition:3:4');
  });

  it('detects identical questions by operation and operands', () => {
    expect(isSameQuestion(q1, q2)).toBe(true);
    expect(isSameQuestion(q1, q3)).toBe(false);
  });
});

