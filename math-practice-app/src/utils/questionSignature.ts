import type { Question } from '../types';

export function getQuestionSignature(question: Question): string {
  return `${question.operation}:${question.firstOperand}:${question.secondOperand}`;
}

export function isSameQuestion(a: Question, b: Question): boolean {
  return getQuestionSignature(a) === getQuestionSignature(b);
}
