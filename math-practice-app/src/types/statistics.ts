import type { DifficultyLevel, MathOperation } from './question';

export interface OperationStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
}

export interface MistakeFactSummary {
  patternId: string;
  factText: string;
  operation: MathOperation;
  incorrectCount: number;
}

export interface MistakeSummaryStatistics {
  activePatternsCount: number;
  masteredPatternsCount: number;
  similarPracticedCount: number;
  reviewCorrectCount: number;
  mostMissedOperation: MathOperation | null;
  mostMissedFacts: MistakeFactSummary[];
}

export interface AppStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
  byOperation: Record<MathOperation, OperationStatistics>;
  byDifficulty: Record<DifficultyLevel, OperationStatistics>;
}

export function createEmptyOperationStatistics(): OperationStatistics {
  return { attempted: 0, correct: 0, incorrect: 0 };
}

export function createEmptyAppStatistics(): AppStatistics {
  return {
    attempted: 0,
    correct: 0,
    incorrect: 0,
    byOperation: {
      addition: createEmptyOperationStatistics(),
      subtraction: createEmptyOperationStatistics(),
      multiplication: createEmptyOperationStatistics(),
      division: createEmptyOperationStatistics(),
    },
    byDifficulty: {
      1: createEmptyOperationStatistics(),
      2: createEmptyOperationStatistics(),
      3: createEmptyOperationStatistics(),
      4: createEmptyOperationStatistics(),
    },
  };
}
