import type { PracticeAttempt } from '../types';
import type { AppStatistics, OperationStatistics } from '../types/statistics';
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
