import type { DifficultyLevel, MathOperation, Question } from '../types';
import { validateQuestion } from '../utils/validation';
import { generateAdditionQuestion } from './generators/addition';
import { generateDivisionQuestion } from './generators/division';
import { generateMultiplicationQuestion } from './generators/multiplication';
import { generateSubtractionQuestion } from './generators/subtraction';
import { randomInt } from '../utils/math';

const MAX_GENERATION_ATTEMPTS = 10;

const OPERATION_GENERATORS: Record<
  MathOperation,
  (difficulty: DifficultyLevel) => Question
> = {
  addition: generateAdditionQuestion,
  subtraction: generateSubtractionQuestion,
  multiplication: generateMultiplicationQuestion,
  division: generateDivisionQuestion,
};

export function generateQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel,
): Question {
  const generator = OPERATION_GENERATORS[operation];

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const question = generator(difficulty);
      if (validateQuestion(question, difficulty)) {
        return question;
      }
    } catch {
      // Retry on generator failure.
    }
  }

  throw new Error(`Failed to generate a valid ${operation} question`);
}

export function generateQuestionFromOperations(
  operations: MathOperation[],
  difficulty: DifficultyLevel,
): Question {
  if (operations.length === 0) {
    throw new Error('At least one operation is required');
  }

  const operation = operations[randomInt(0, operations.length - 1)];
  return generateQuestion(operation, difficulty);
}

export function generateQuestionsForAllOperations(
  difficulty: DifficultyLevel,
): Record<MathOperation, Question> {
  return {
    addition: generateQuestion('addition', difficulty),
    subtraction: generateQuestion('subtraction', difficulty),
    multiplication: generateQuestion('multiplication', difficulty),
    division: generateQuestion('division', difficulty),
  };
}
