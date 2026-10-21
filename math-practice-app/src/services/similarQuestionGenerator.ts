import type { MathOperation, MistakePattern, Question } from '../types';
import {
  getAdditionConstraints,
  getDivisionConstraints,
  getMultiplicationConstraints,
  getSubtractionConstraints,
} from './difficultyRules';
import { buildQuestionBase } from './generators/shared';
import { randomInt } from '../utils/math';
import { validateQuestion } from '../utils/validation';

export type SimilarityStrategy = 'reversed' | 'nearby' | 'fact-family';

export function getAvailableStrategies(
  pattern: MistakePattern,
): SimilarityStrategy[] {
  const strategies: SimilarityStrategy[] = ['nearby', 'fact-family'];

  if (
    (pattern.operation === 'addition' ||
      pattern.operation === 'multiplication') &&
    pattern.firstOperand !== pattern.secondOperand
  ) {
    strategies.push('reversed');
  }

  return strategies;
}

export function generateReversedQuestion(
  pattern: MistakePattern,
): Question | null {
  if (
    pattern.operation !== 'addition' &&
    pattern.operation !== 'multiplication'
  ) {
    return null;
  }

  if (pattern.firstOperand === pattern.secondOperand) {
    return null;
  }

  const base = buildQuestionBase({
    operation: pattern.operation,
    difficulty: pattern.difficulty,
    firstOperand: pattern.secondOperand,
    secondOperand: pattern.firstOperand,
    correctAnswer: pattern.correctAnswer,
    allowNegativeChoices: false,
  });

  return {
    ...base,
    source: 'mistake-review',
    mistakePatternId: pattern.id,
  };
}

export function generateFactFamilyQuestion(
  pattern: MistakePattern,
): Question | null {
  const { operation, firstOperand, secondOperand, correctAnswer, difficulty } =
    pattern;

  if (operation === 'addition') {
    // A + B = C  ->  C - B = A (or C - A = B)
    const useFirst = randomInt(0, 1) === 0;
    const subSecond = useFirst ? firstOperand : secondOperand;
    const subAns = useFirst ? secondOperand : firstOperand;

    const base = buildQuestionBase({
      operation: 'subtraction',
      difficulty,
      firstOperand: correctAnswer,
      secondOperand: subSecond,
      correctAnswer: subAns,
      allowNegativeChoices:
        getSubtractionConstraints(difficulty).allowNegativeAnswers,
    });

    return {
      ...base,
      source: 'mistake-review',
      mistakePatternId: pattern.id,
    };
  }

  if (operation === 'subtraction') {
    // A - B = C  ->  B + C = A
    const useBFirst = randomInt(0, 1) === 0;
    const addFirst = useBFirst ? secondOperand : correctAnswer;
    const addSecond = useBFirst ? correctAnswer : secondOperand;

    const base = buildQuestionBase({
      operation: 'addition',
      difficulty,
      firstOperand: addFirst,
      secondOperand: addSecond,
      correctAnswer: firstOperand,
      allowNegativeChoices: false,
    });

    return {
      ...base,
      source: 'mistake-review',
      mistakePatternId: pattern.id,
    };
  }

  if (operation === 'multiplication') {
    // A * B = C  ->  C / B = A (if B > 0)
    let divisor = secondOperand;
    let quotient = firstOperand;

    if (divisor === 0) {
      if (firstOperand === 0) {
        return null; // 0 * 0 cannot yield valid division
      }
      divisor = firstOperand;
      quotient = secondOperand;
    }

    const base = buildQuestionBase({
      operation: 'division',
      difficulty,
      firstOperand: correctAnswer,
      secondOperand: divisor,
      correctAnswer: quotient,
      allowNegativeChoices: false,
    });

    return {
      ...base,
      source: 'mistake-review',
      mistakePatternId: pattern.id,
    };
  }

  if (operation === 'division') {
    // A / B = C  ->  B * C = A
    const useBFirst = randomInt(0, 1) === 0;
    const factorA = useBFirst ? secondOperand : correctAnswer;
    const factorB = useBFirst ? correctAnswer : secondOperand;

    const base = buildQuestionBase({
      operation: 'multiplication',
      difficulty,
      firstOperand: factorA,
      secondOperand: factorB,
      correctAnswer: firstOperand,
      allowNegativeChoices: false,
    });

    return {
      ...base,
      source: 'mistake-review',
      mistakePatternId: pattern.id,
    };
  }

  return null;
}

export function generateNearbyQuestion(pattern: MistakePattern): Question {
  const { operation, firstOperand, secondOperand, difficulty } = pattern;
  const deltas = [-1, 1, -2, 2];

  for (const delta of deltas) {
    if (operation === 'addition') {
      const constraints = getAdditionConstraints(difficulty);
      const newFirst = Math.max(
        constraints.operandMin,
        Math.min(constraints.operandMax, firstOperand + delta),
      );
      if (newFirst !== firstOperand) {
        const sum = newFirst + secondOperand;
        if (!constraints.maxSum || sum <= constraints.maxSum) {
          const base = buildQuestionBase({
            operation: 'addition',
            difficulty,
            firstOperand: newFirst,
            secondOperand,
            correctAnswer: sum,
            allowNegativeChoices: false,
          });
          return {
            ...base,
            source: 'mistake-review',
            mistakePatternId: pattern.id,
          };
        }
      }
    } else if (operation === 'subtraction') {
      const constraints = getSubtractionConstraints(difficulty);
      const newFirst = Math.max(
        constraints.operandMin,
        Math.min(constraints.operandMax, firstOperand + delta),
      );
      if (
        newFirst !== firstOperand &&
        (constraints.allowNegativeAnswers || newFirst >= secondOperand)
      ) {
        const base = buildQuestionBase({
          operation: 'subtraction',
          difficulty,
          firstOperand: newFirst,
          secondOperand,
          correctAnswer: newFirst - secondOperand,
          allowNegativeChoices: constraints.allowNegativeAnswers,
        });
        return {
          ...base,
          source: 'mistake-review',
          mistakePatternId: pattern.id,
        };
      }
    } else if (operation === 'multiplication') {
      const constraints = getMultiplicationConstraints(difficulty);
      const maxFactor = constraints.factorRanges[0]?.max ?? 12;
      const newSecond = Math.max(0, Math.min(maxFactor, secondOperand + delta));
      if (newSecond !== secondOperand) {
        const base = buildQuestionBase({
          operation: 'multiplication',
          difficulty,
          firstOperand,
          secondOperand: newSecond,
          correctAnswer: firstOperand * newSecond,
          allowNegativeChoices: false,
        });
        return {
          ...base,
          source: 'mistake-review',
          mistakePatternId: pattern.id,
        };
      }
    } else if (operation === 'division') {
      // In division: A / B = C. Vary quotient by delta: C' = C + delta. New dividend = B * C'
      const constraints = getDivisionConstraints(difficulty);
      const newQuotient = Math.max(
        constraints.quotientMin,
        Math.min(constraints.quotientMax, pattern.correctAnswer + delta),
      );
      if (newQuotient !== pattern.correctAnswer) {
        const newDividend = secondOperand * newQuotient;
        if (
          !constraints.maxDividend ||
          newDividend <= constraints.maxDividend
        ) {
          const base = buildQuestionBase({
            operation: 'division',
            difficulty,
            firstOperand: newDividend,
            secondOperand,
            correctAnswer: newQuotient,
            allowNegativeChoices: false,
          });
          return {
            ...base,
            source: 'mistake-review',
            mistakePatternId: pattern.id,
          };
        }
      }
    }
  }

  // Fallback: slight tweak
  const newOp2 = secondOperand === 0 ? 1 : secondOperand + 1;
  const ans = computeAnswer(operation, firstOperand, newOp2);
  const base = buildQuestionBase({
    operation,
    difficulty,
    firstOperand,
    secondOperand: newOp2,
    correctAnswer: ans,
    allowNegativeChoices: false,
  });

  return {
    ...base,
    source: 'mistake-review',
    mistakePatternId: pattern.id,
  };
}

function computeAnswer(operation: MathOperation, a: number, b: number): number {
  switch (operation) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return b === 0 ? a : Math.floor(a / b);
  }
}

export function generateSimilarQuestion(
  pattern: MistakePattern,
  preferredStrategy?: SimilarityStrategy,
): Question {
  const available = getAvailableStrategies(pattern);

  if (preferredStrategy && available.includes(preferredStrategy)) {
    if (preferredStrategy === 'reversed') {
      const q = generateReversedQuestion(pattern);
      if (q && validateQuestion(q, pattern.difficulty)) {
        return q;
      }
    } else if (preferredStrategy === 'fact-family') {
      const q = generateFactFamilyQuestion(pattern);
      if (q && validateQuestion(q, pattern.difficulty)) {
        return q;
      }
    } else if (preferredStrategy === 'nearby') {
      const q = generateNearbyQuestion(pattern);
      if (validateQuestion(q, pattern.difficulty)) {
        return q;
      }
    }
  }

  // Try strategies in randomized or fallback order
  const shuffledStrategies = [...available].sort(() =>
    Math.random() > 0.5 ? 1 : -1,
  );

  for (const strategy of shuffledStrategies) {
    let q: Question | null = null;
    if (strategy === 'reversed') {
      q = generateReversedQuestion(pattern);
    } else if (strategy === 'fact-family') {
      q = generateFactFamilyQuestion(pattern);
    } else if (strategy === 'nearby') {
      q = generateNearbyQuestion(pattern);
    }

    if (q && validateQuestion(q, pattern.difficulty)) {
      return q;
    }
  }

  // Final guaranteed fallback: nearby question
  return generateNearbyQuestion(pattern);
}
