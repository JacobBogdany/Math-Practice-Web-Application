import type { MathOperation, MistakePattern, PracticeAttempt } from '../types';
import type {
  AppStatistics,
  MistakeSummaryStatistics,
  OperationStatistics,
} from '../types/statistics';
import { createEmptyAppStatistics } from '../types/statistics';

export function calculateOperationAccuracy(stats: OperationStatistics): number {
  if (stats.attempted === 0) {
    return 0;
  }

  return Math.round((stats.correct / stats.attempted) * 100);
}

function recordAttempt(
  stats: OperationStatistics,
  selfReportedCorrect: boolean,
): void {
  stats.attempted += 1;
  if (selfReportedCorrect) {
    stats.correct += 1;
  } else {
    stats.incorrect += 1;
  }
}

export function calculateAppStatistics(
  attempts: PracticeAttempt[],
): AppStatistics {
  const statistics = createEmptyAppStatistics();

  for (const attempt of attempts) {
    statistics.attempted += 1;
    if (attempt.selfReportedCorrect) {
      statistics.correct += 1;
    } else {
      statistics.incorrect += 1;
    }

    recordAttempt(
      statistics.byOperation[attempt.operation],
      attempt.selfReportedCorrect,
    );
    recordAttempt(
      statistics.byDifficulty[attempt.difficulty],
      attempt.selfReportedCorrect,
    );
  }

  return statistics;
}

export function calculateOverallAccuracy(statistics: AppStatistics): number {
  return calculateOperationAccuracy(statistics);
}

const OPERATION_SYMBOLS: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export function calculateMistakeStatistics(
  patterns: MistakePattern[],
  attempts: PracticeAttempt[],
): MistakeSummaryStatistics {
  const activePatterns = patterns.filter((p) => !p.mastered);
  const masteredPatterns = patterns.filter((p) => p.mastered);

  const reviewAttempts = attempts.filter((a) => a.source === 'mistake-review');
  const similarPracticedCount = reviewAttempts.length;
  const reviewCorrectCount = reviewAttempts.filter(
    (a) => a.selfReportedCorrect,
  ).length;

  const operationMistakeCounts: Record<MathOperation, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
  };

  for (const pattern of patterns) {
    operationMistakeCounts[pattern.operation] += pattern.incorrectCount;
  }

  let mostMissedOperation: MathOperation | null = null;
  let maxOpCount = 0;

  for (const [op, count] of Object.entries(operationMistakeCounts) as [
    MathOperation,
    number,
  ][]) {
    if (count > maxOpCount) {
      maxOpCount = count;
      mostMissedOperation = op;
    }
  }

  const sortedPatterns = [...patterns].sort((a, b) => {
    const diff = b.incorrectCount - a.incorrectCount;
    if (diff !== 0) {
      return diff;
    }
    return b.lastIncorrectAt.localeCompare(a.lastIncorrectAt);
  });

  const mostMissedFacts = sortedPatterns.slice(0, 5).map((pattern) => ({
    patternId: pattern.id,
    factText: `${pattern.firstOperand} ${OPERATION_SYMBOLS[pattern.operation]} ${pattern.secondOperand} = ${pattern.correctAnswer}`,
    operation: pattern.operation,
    incorrectCount: pattern.incorrectCount,
  }));

  return {
    activePatternsCount: activePatterns.length,
    masteredPatternsCount: masteredPatterns.length,
    similarPracticedCount,
    reviewCorrectCount,
    mostMissedOperation: maxOpCount > 0 ? mostMissedOperation : null,
    mostMissedFacts,
  };
}
