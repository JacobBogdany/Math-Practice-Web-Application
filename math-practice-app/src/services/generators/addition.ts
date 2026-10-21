import type { DifficultyLevel, Question } from '../../types';
import { getAdditionConstraints } from '../difficultyRules';
import { buildQuestionBase } from './shared';
import { randomInt } from '../../utils/math';

const MAX_GENERATION_ATTEMPTS = 50;

export function generateAdditionQuestion(
  difficulty: DifficultyLevel,
): Question {
  const rules = getAdditionConstraints(difficulty);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const firstOperand = randomInt(rules.operandMin, rules.operandMax);
    const secondOperand = randomInt(rules.operandMin, rules.operandMax);
    const correctAnswer = firstOperand + secondOperand;

    if (rules.maxSum !== undefined && correctAnswer > rules.maxSum) {
      continue;
    }

    return buildQuestionBase({
      operation: 'addition',
      difficulty,
      firstOperand,
      secondOperand,
      correctAnswer,
      allowNegativeChoices: false,
    });
  }

  throw new Error('Failed to generate an addition question');
}
