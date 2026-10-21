import type { MathOperation } from '../types';
import { shuffle } from '../utils/shuffle';

export interface DistractorContext {
  operation: MathOperation;
  firstOperand: number;
  secondOperand: number;
  correctAnswer: number;
  allowNegativeChoices: boolean;
}

export const MAX_DISTRACTOR_ATTEMPTS = 25;

function isValidDistractor(
  value: number,
  correctAnswer: number,
  allowNegativeChoices: boolean,
): boolean {
  return (
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value !== correctAnswer &&
    (allowNegativeChoices || value >= 0)
  );
}

function addCandidate(
  candidates: Set<number>,
  value: number,
  correctAnswer: number,
  allowNegativeChoices: boolean,
): void {
  if (isValidDistractor(value, correctAnswer, allowNegativeChoices)) {
    candidates.add(value);
  }
}

function addNearbyValues(
  candidates: Set<number>,
  value: number,
  correctAnswer: number,
  allowNegativeChoices: boolean,
  deltas: number[] = [-3, -2, -1, 1, 2, 3, 4],
): void {
  for (const delta of deltas) {
    addCandidate(
      candidates,
      value + delta,
      correctAnswer,
      allowNegativeChoices,
    );
  }
}

function collectAdditionDistractors(context: DistractorContext): Set<number> {
  const { firstOperand, secondOperand, correctAnswer, allowNegativeChoices } =
    context;
  const candidates = new Set<number>();

  addNearbyValues(
    candidates,
    correctAnswer,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + secondOperand + 1,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + secondOperand - 1,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + 1 + secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + (secondOperand + 1),
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand - 1 + secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + (secondOperand - 1),
    correctAnswer,
    allowNegativeChoices,
  );

  return candidates;
}

function collectSubtractionDistractors(
  context: DistractorContext,
): Set<number> {
  const { firstOperand, secondOperand, correctAnswer, allowNegativeChoices } =
    context;
  const candidates = new Set<number>();

  addNearbyValues(
    candidates,
    correctAnswer,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand - (secondOperand - 1),
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand - (secondOperand + 1),
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + 1 - secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand - 1 - secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    secondOperand - firstOperand,
    correctAnswer,
    allowNegativeChoices,
  );

  return candidates;
}

function collectMultiplicationDistractors(
  context: DistractorContext,
): Set<number> {
  const { firstOperand, secondOperand, correctAnswer, allowNegativeChoices } =
    context;
  const candidates = new Set<number>();

  addNearbyValues(
    candidates,
    correctAnswer,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    firstOperand + secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );

  if (secondOperand > 0) {
    addCandidate(
      candidates,
      firstOperand * (secondOperand - 1),
      correctAnswer,
      allowNegativeChoices,
    );
    addCandidate(
      candidates,
      firstOperand * (secondOperand + 1),
      correctAnswer,
      allowNegativeChoices,
    );
  }

  if (firstOperand > 0) {
    addCandidate(
      candidates,
      (firstOperand - 1) * secondOperand,
      correctAnswer,
      allowNegativeChoices,
    );
    addCandidate(
      candidates,
      (firstOperand + 1) * secondOperand,
      correctAnswer,
      allowNegativeChoices,
    );
  }

  addCandidate(
    candidates,
    correctAnswer + firstOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    correctAnswer - firstOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    correctAnswer + secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    correctAnswer - secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );

  return candidates;
}

function collectDivisionDistractors(context: DistractorContext): Set<number> {
  const { firstOperand, secondOperand, correctAnswer, allowNegativeChoices } =
    context;
  const candidates = new Set<number>();

  addNearbyValues(
    candidates,
    correctAnswer,
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(candidates, secondOperand, correctAnswer, allowNegativeChoices);
  addCandidate(
    candidates,
    firstOperand - secondOperand,
    correctAnswer,
    allowNegativeChoices,
  );

  if (secondOperand > 1) {
    const smallerDivisor = secondOperand - 1;
    if (firstOperand % smallerDivisor === 0) {
      addCandidate(
        candidates,
        firstOperand / smallerDivisor,
        correctAnswer,
        allowNegativeChoices,
      );
    }
  }

  const largerDivisor = secondOperand + 1;
  if (firstOperand % largerDivisor === 0) {
    addCandidate(
      candidates,
      firstOperand / largerDivisor,
      correctAnswer,
      allowNegativeChoices,
    );
  }

  if (correctAnswer > 0 && firstOperand % correctAnswer === 0) {
    addCandidate(
      candidates,
      firstOperand / correctAnswer,
      correctAnswer,
      allowNegativeChoices,
    );
  }

  addCandidate(
    candidates,
    secondOperand * (correctAnswer + 1),
    correctAnswer,
    allowNegativeChoices,
  );
  addCandidate(
    candidates,
    secondOperand * Math.max(0, correctAnswer - 1),
    correctAnswer,
    allowNegativeChoices,
  );

  return candidates;
}

function collectDistractorCandidates(context: DistractorContext): Set<number> {
  switch (context.operation) {
    case 'addition':
      return collectAdditionDistractors(context);
    case 'subtraction':
      return collectSubtractionDistractors(context);
    case 'multiplication':
      return collectMultiplicationDistractors(context);
    case 'division':
      return collectDivisionDistractors(context);
    default:
      return new Set<number>();
  }
}

function expandFallbackCandidates(
  context: DistractorContext,
  existing: Set<number>,
): void {
  let offset = 4;

  while (existing.size < 3 && offset < 20) {
    addCandidate(
      existing,
      context.correctAnswer + offset,
      context.correctAnswer,
      context.allowNegativeChoices,
    );
    addCandidate(
      existing,
      context.correctAnswer - offset,
      context.correctAnswer,
      context.allowNegativeChoices,
    );
    offset += 1;
  }
}

export function generateDistractors(context: DistractorContext): number[] {
  const candidates = collectDistractorCandidates(context);

  if (candidates.size < 3) {
    expandFallbackCandidates(context, candidates);
  }

  for (let attempt = 0; attempt < MAX_DISTRACTOR_ATTEMPTS; attempt += 1) {
    const pool = shuffle([...candidates]);

    if (pool.length < 3) {
      expandFallbackCandidates(context, candidates);
      continue;
    }

    const selected = pool.slice(0, 3);
    if (selected.length === 3 && new Set(selected).size === 3) {
      return selected;
    }
  }

  expandFallbackCandidates(context, candidates);
  const fallbackPool = shuffle([...candidates]).slice(0, 3);
  if (fallbackPool.length < 3 || new Set(fallbackPool).size !== 3) {
    throw new Error('Failed to generate three unique distractors');
  }

  return fallbackPool;
}

export function generateChoices(context: DistractorContext): number[] {
  const distractors = generateDistractors(context);
  return shuffle([context.correctAnswer, ...distractors]);
}

export function collectDistractorCandidatesForTest(
  context: DistractorContext,
): number[] {
  return [...collectDistractorCandidates(context)];
}
