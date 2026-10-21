import type { DifficultyLevel, Question } from '../../types';
import { getSubtractionConstraints } from '../difficultyRules';
import { buildQuestionBase } from './shared';
import { randomInt } from '../../utils/math';

const MAX_GENERATION_ATTEMPTS = 50;

export function generateSubtractionQuestion(
  difficulty: DifficultyLevel,
): Question {
  const rules = getSubtractionConstraints(difficulty);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    let firstOperand = randomInt(rules.operandMin, rules.operandMax);
    let secondOperand = randomInt(rules.operandMin, rules.operandMax);

    if (!rules.allowNegativeAnswers && firstOperand < secondOperand) {
      [firstOperand, secondOperand] = [secondOperand, firstOperand];
    }

    const correctAnswer = firstOperand - secondOperand;

    if (!rules.allowNegativeAnswers && correctAnswer < 0) {
      continue;
    }

    return buildQuestionBase({
      operation: 'subtraction',
      difficulty,
      firstOperand,
      secondOperand,
      correctAnswer,
      allowNegativeChoices: rules.allowNegativeAnswers,
    });
  }

  throw new Error('Failed to generate a subtraction question');
}
