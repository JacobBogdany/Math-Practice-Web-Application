import type { DifficultyLevel } from '../types';

export interface AdditionConstraints {
  operandMin: number;
  operandMax: number;
  maxSum?: number;
}

export interface SubtractionConstraints {
  operandMin: number;
  operandMax: number;
  allowNegativeAnswers: boolean;
}

export interface MultiplicationConstraints {
  factorRanges: Array<{ min: number; max: number }>;
}

export interface DivisionConstraints {
  divisorMin: number;
  divisorMax: number;
  quotientMin: number;
  quotientMax: number;
  maxDividend?: number;
}

const ADDITION_RULES: Record<DifficultyLevel, AdditionConstraints> = {
  1: { operandMin: 0, operandMax: 10, maxSum: 20 },
  2: { operandMin: 0, operandMax: 50, maxSum: 100 },
  3: { operandMin: 0, operandMax: 100 },
  4: { operandMin: 0, operandMax: 1000 },
};

const SUBTRACTION_RULES: Record<DifficultyLevel, SubtractionConstraints> = {
  1: { operandMin: 0, operandMax: 10, allowNegativeAnswers: false },
  2: { operandMin: 0, operandMax: 50, allowNegativeAnswers: false },
  3: { operandMin: 0, operandMax: 100, allowNegativeAnswers: false },
  4: { operandMin: 0, operandMax: 1000, allowNegativeAnswers: true },
};

const MULTIPLICATION_RULES: Record<DifficultyLevel, MultiplicationConstraints> =
  {
    1: { factorRanges: [{ min: 0, max: 5 }] },
    2: { factorRanges: [{ min: 0, max: 10 }] },
    3: {
      factorRanges: [
        { min: 0, max: 9 },
        { min: 10, max: 99 },
      ],
    },
    4: {
      factorRanges: [
        { min: 10, max: 99 },
        { min: 0, max: 9 },
        { min: 10, max: 99 },
      ],
    },
  };

const DIVISION_RULES: Record<DifficultyLevel, DivisionConstraints> = {
  1: { divisorMin: 1, divisorMax: 5, quotientMin: 0, quotientMax: 10 },
  2: { divisorMin: 1, divisorMax: 10, quotientMin: 0, quotientMax: 12 },
  3: {
    divisorMin: 1,
    divisorMax: 12,
    quotientMin: 0,
    quotientMax: 12,
    maxDividend: 144,
  },
  4: {
    divisorMin: 1,
    divisorMax: 99,
    quotientMin: 0,
    quotientMax: 100,
    maxDividend: 9999,
  },
};

export function getAdditionConstraints(
  difficulty: DifficultyLevel,
): AdditionConstraints {
  return ADDITION_RULES[difficulty];
}

export function getSubtractionConstraints(
  difficulty: DifficultyLevel,
): SubtractionConstraints {
  return SUBTRACTION_RULES[difficulty];
}

export function getMultiplicationConstraints(
  difficulty: DifficultyLevel,
): MultiplicationConstraints {
  return MULTIPLICATION_RULES[difficulty];
}

export function getDivisionConstraints(
  difficulty: DifficultyLevel,
): DivisionConstraints {
  return DIVISION_RULES[difficulty];
}

export function matchesAdditionConstraints(
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel,
): boolean {
  const rules = getAdditionConstraints(difficulty);
  const operandsInRange =
    firstOperand >= rules.operandMin &&
    firstOperand <= rules.operandMax &&
    secondOperand >= rules.operandMin &&
    secondOperand <= rules.operandMax;
  const sum = firstOperand + secondOperand;

  return operandsInRange && (rules.maxSum === undefined || sum <= rules.maxSum);
}

export function matchesSubtractionConstraints(
  firstOperand: number,
  secondOperand: number,
  correctAnswer: number,
  difficulty: DifficultyLevel,
): boolean {
  const rules = getSubtractionConstraints(difficulty);
  const operandsInRange =
    firstOperand >= rules.operandMin &&
    firstOperand <= rules.operandMax &&
    secondOperand >= rules.operandMin &&
    secondOperand <= rules.operandMax;

  if (!operandsInRange) {
    return false;
  }

  return rules.allowNegativeAnswers || correctAnswer >= 0;
}

export function matchesMultiplicationConstraints(
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel,
): boolean {
  const rules = getMultiplicationConstraints(difficulty);

  if (difficulty === 1 || difficulty === 2) {
    const range = rules.factorRanges[0];
    return (
      firstOperand >= range.min &&
      firstOperand <= range.max &&
      secondOperand >= range.min &&
      secondOperand <= range.max
    );
  }

  if (difficulty === 3) {
    const [oneDigit, twoDigit] = rules.factorRanges;
    return (
      matchesFactorPair(firstOperand, secondOperand, oneDigit, twoDigit) ||
      matchesFactorPair(firstOperand, secondOperand, twoDigit, oneDigit)
    );
  }

  const [twoDigit, oneDigit, twoByTwo] = rules.factorRanges;
  return (
    matchesFactorPair(firstOperand, secondOperand, twoDigit, oneDigit) ||
    matchesFactorPair(firstOperand, secondOperand, oneDigit, twoDigit) ||
    matchesFactorPair(firstOperand, secondOperand, twoByTwo, twoByTwo)
  );
}

function matchesFactorPair(
  first: number,
  second: number,
  firstRange: { min: number; max: number },
  secondRange: { min: number; max: number },
): boolean {
  return (
    first >= firstRange.min &&
    first <= firstRange.max &&
    second >= secondRange.min &&
    second <= secondRange.max
  );
}

export function matchesDivisionConstraints(
  dividend: number,
  divisor: number,
  quotient: number,
  difficulty: DifficultyLevel,
): boolean {
  const rules = getDivisionConstraints(difficulty);

  if (
    divisor < rules.divisorMin ||
    divisor > rules.divisorMax ||
    divisor === 0
  ) {
    return false;
  }

  if (quotient < rules.quotientMin || quotient > rules.quotientMax) {
    return false;
  }

  if (rules.maxDividend !== undefined && dividend > rules.maxDividend) {
    return false;
  }

  return dividend === divisor * quotient && Number.isInteger(quotient);
}
