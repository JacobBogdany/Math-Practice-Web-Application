import type { DifficultyLevel, MathOperation, Question } from '../types';
import { createId } from '../utils/ids';
import { getQuestionSignature } from '../utils/questionSignature';
import { validateQuestion } from '../utils/validation';
import { generateAdditionQuestion } from './generators/addition';
import { generateDivisionQuestion } from './generators/division';
import { generateMultiplicationQuestion } from './generators/multiplication';
import { generateSubtractionQuestion } from './generators/subtraction';
import { formatDisplayText } from './generators/shared';
import { randomInt } from '../utils/math';

const MAX_GENERATION_ATTEMPTS = 10;
const MAX_UNIQUE_GENERATION_ATTEMPTS = 30;

export { getQuestionSignature };

const OPERATION_GENERATORS: Record<
  MathOperation,
  (difficulty: DifficultyLevel) => Question
> = {
  addition: generateAdditionQuestion,
  subtraction: generateSubtractionQuestion,
  multiplication: generateMultiplicationQuestion,
  division: generateDivisionQuestion,
};

export function createFallbackQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel,
): Question {
  switch (operation) {
    case 'addition':
      return {
        id: createId('q-fallback'),
        operation: 'addition',
        difficulty,
        firstOperand: 2,
        secondOperand: 2,
        displayText: formatDisplayText('addition', 2, 2),
        correctAnswer: 4,
        choices: [2, 3, 4, 5],
        source: 'regular',
      };
    case 'subtraction':
      return {
        id: createId('q-fallback'),
        operation: 'subtraction',
        difficulty,
        firstOperand: 5,
        secondOperand: 3,
        displayText: formatDisplayText('subtraction', 5, 3),
        correctAnswer: 2,
        choices: [1, 2, 3, 4],
        source: 'regular',
      };
    case 'multiplication':
      return {
        id: createId('q-fallback'),
        operation: 'multiplication',
        difficulty,
        firstOperand: 2,
        secondOperand: 3,
        displayText: formatDisplayText('multiplication', 2, 3),
        correctAnswer: 6,
        choices: [4, 5, 6, 7],
        source: 'regular',
      };
    case 'division':
      return {
        id: createId('q-fallback'),
        operation: 'division',
        difficulty,
        firstOperand: 6,
        secondOperand: 2,
        displayText: formatDisplayText('division', 6, 2),
        correctAnswer: 3,
        choices: [2, 3, 4, 5],
        source: 'regular',
      };
  }
}

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

  console.error(
    `[MathPractice] Failed to generate a valid ${operation} question after ${MAX_GENERATION_ATTEMPTS} attempts. Using fallback question.`,
  );
  return createFallbackQuestion(operation, difficulty);
}

export function generateQuestionFromOperations(
  operations: MathOperation[],
  difficulty: DifficultyLevel,
  excludeSignatures: string[] = [],
): Question {
  if (operations.length === 0) {
    throw new Error('At least one operation is required');
  }

  for (
    let attempt = 0;
    attempt < MAX_UNIQUE_GENERATION_ATTEMPTS;
    attempt += 1
  ) {
    const operation = operations[randomInt(0, operations.length - 1)];
    const question = generateQuestion(operation, difficulty);
    const signature = getQuestionSignature(question);

    if (!excludeSignatures.includes(signature)) {
      return question;
    }
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
