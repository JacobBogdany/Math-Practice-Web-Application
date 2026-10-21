import type { DifficultyLevel, Question } from '../../types';
import { getMultiplicationConstraints } from '../difficultyRules';
import { buildQuestionBase } from './shared';
import { randomInt } from '../../utils/math';
import { shuffle } from '../../utils/shuffle';

const MAX_GENERATION_ATTEMPTS = 50;

export function generateMultiplicationQuestion(
  difficulty: DifficultyLevel,
): Question {
  const rules = getMultiplicationConstraints(difficulty);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const pair = pickFactorPair(difficulty, rules.factorRanges);

    if (!pair) {
      continue;
    }

    const [firstOperand, secondOperand] = pair;
    const correctAnswer = firstOperand * secondOperand;

    return buildQuestionBase({
      operation: 'multiplication',
      difficulty,
      firstOperand,
      secondOperand,
      correctAnswer,
      allowNegativeChoices: false,
    });
  }

  throw new Error('Failed to generate a multiplication question');
}

function pickFactorPair(
  difficulty: DifficultyLevel,
  factorRanges: Array<{ min: number; max: number }>,
): [number, number] | null {
  if (difficulty === 1 || difficulty === 2) {
    const range = factorRanges[0];
    return [randomInt(range.min, range.max), randomInt(range.min, range.max)];
  }

  if (difficulty === 3) {
    const [oneDigit, twoDigit] = factorRanges;
    const useTwoDigitFirst = randomInt(0, 1) === 0;

    if (useTwoDigitFirst) {
      return [
        randomInt(oneDigit.min, oneDigit.max),
        randomInt(twoDigit.min, twoDigit.max),
      ];
    }

    return [
      randomInt(twoDigit.min, twoDigit.max),
      randomInt(oneDigit.min, oneDigit.max),
    ];
  }

  const patterns: Array<
    [{ min: number; max: number }, { min: number; max: number }]
  > = [
    [factorRanges[0], factorRanges[1]],
    [factorRanges[1], factorRanges[0]],
    [factorRanges[2], factorRanges[2]],
  ];
  const [firstRange, secondRange] = shuffle(patterns)[0];

  return [
    randomInt(firstRange.min, firstRange.max),
    randomInt(secondRange.min, secondRange.max),
  ];
}
