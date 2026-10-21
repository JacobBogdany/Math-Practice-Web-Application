import type { DifficultyLevel, MathOperation, Question } from '../types';
import {
  matchesAdditionConstraints,
  matchesDivisionConstraints,
  matchesMultiplicationConstraints,
  matchesSubtractionConstraints,
} from '../services/difficultyRules';

export function validateQuestion(
  question: Question,
  difficulty: DifficultyLevel,
): boolean {
  if (!isSupportedOperation(question.operation)) {
    return false;
  }

  if (!Number.isFinite(question.correctAnswer)) {
    return false;
  }

  if (question.choices.length !== 4) {
    return false;
  }

  const uniqueChoices = new Set(question.choices);
  if (uniqueChoices.size !== 4) {
    return false;
  }

  if (!question.choices.includes(question.correctAnswer)) {
    return false;
  }

  if (question.difficulty !== difficulty) {
    return false;
  }

  if (!matchesOperationRules(question)) {
    return false;
  }

  if (!matchesDifficultyRules(question, difficulty)) {
    return false;
  }

  return true;
}

function isSupportedOperation(operation: string): operation is MathOperation {
  return (
    operation === 'addition' ||
    operation === 'subtraction' ||
    operation === 'multiplication' ||
    operation === 'division'
  );
}

function matchesOperationRules(question: Question): boolean {
  switch (question.operation) {
    case 'addition':
      return (
        question.correctAnswer ===
        question.firstOperand + question.secondOperand
      );
    case 'subtraction':
      return (
        question.correctAnswer ===
        question.firstOperand - question.secondOperand
      );
    case 'multiplication':
      return (
        question.correctAnswer ===
        question.firstOperand * question.secondOperand
      );
    case 'division':
      return (
        question.secondOperand !== 0 &&
        question.firstOperand ===
          question.secondOperand * question.correctAnswer &&
        Number.isInteger(question.correctAnswer)
      );
    default:
      return false;
  }
}

function matchesDifficultyRules(
  question: Question,
  difficulty: DifficultyLevel,
): boolean {
  switch (question.operation) {
    case 'addition':
      return matchesAdditionConstraints(
        question.firstOperand,
        question.secondOperand,
        difficulty,
      );
    case 'subtraction':
      return matchesSubtractionConstraints(
        question.firstOperand,
        question.secondOperand,
        question.correctAnswer,
        difficulty,
      );
    case 'multiplication':
      return matchesMultiplicationConstraints(
        question.firstOperand,
        question.secondOperand,
        difficulty,
      );
    case 'division':
      return matchesDivisionConstraints(
        question.firstOperand,
        question.secondOperand,
        question.correctAnswer,
        difficulty,
      );
    default:
      return false;
  }
}
