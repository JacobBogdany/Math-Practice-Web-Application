import type { DifficultyLevel, Question } from '../../types';
import { getDivisionConstraints } from '../difficultyRules';
import { buildQuestionBase } from './shared';
import { randomInt } from '../../utils/math';

const MAX_GENERATION_ATTEMPTS = 100;

export function generateDivisionQuestion(
  difficulty: DifficultyLevel,
): Question {
  const rules = getDivisionConstraints(difficulty);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const divisor = randomInt(rules.divisorMin, rules.divisorMax);
    const quotient = randomInt(rules.quotientMin, rules.quotientMax);
    const dividend = divisor * quotient;

    if (divisor === 0) {
      continue;
    }

    if (rules.maxDividend !== undefined && dividend > rules.maxDividend) {
      continue;
    }

    return buildQuestionBase({
      operation: 'division',
      difficulty,
      firstOperand: dividend,
      secondOperand: divisor,
      correctAnswer: quotient,
      allowNegativeChoices: false,
    });
  }

  throw new Error('Failed to generate a division question');
}
