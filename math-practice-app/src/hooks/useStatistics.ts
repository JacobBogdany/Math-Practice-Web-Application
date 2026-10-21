import { useCallback, useMemo, useState } from 'react';
import { useAppSettings } from '../context/useAppSettings';
import {
  clearPracticeHistory,
  loadAttempts,
  loadMistakePatterns,
  loadSessions,
} from '../services/storage/practiceDataStore';
import {
  calculateAppStatistics,
  calculateMistakeStatistics,
} from '../services/statisticsService';
import type { PracticeSession } from '../types';

function sortSessionsNewestFirst(
  sessions: PracticeSession[],
): PracticeSession[] {
  return sessions.slice().sort((left, right) => {
    const leftTime = left.completedAt ?? left.startedAt;
    const rightTime = right.completedAt ?? right.startedAt;
    return rightTime.localeCompare(leftTime);
  });
}

export function useStatistics() {
  const { reportStorageError } = useAppSettings();
  const [refreshKey, setRefreshKey] = useState(0);

  const attempts = useMemo(() => {
    void refreshKey;
    return loadAttempts();
  }, [refreshKey]);

  const sessions = useMemo(() => {
    void refreshKey;
    return sortSessionsNewestFirst(loadSessions());
  }, [refreshKey]);

  const statistics = useMemo(
    () => calculateAppStatistics(attempts),
    [attempts],
  );

  const mistakePatterns = useMemo(() => {
    void refreshKey;
    return loadMistakePatterns();
  }, [refreshKey]);

  const mistakeStatistics = useMemo(
    () => calculateMistakeStatistics(mistakePatterns, attempts),
    [mistakePatterns, attempts],
  );

  const hasAttempts = attempts.length > 0;
  const hasSessions = sessions.length > 0;
  const hasMistakes = mistakePatterns.length > 0;

  const refreshStatistics = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const resetStatistics = useCallback(() => {
    const result = clearPracticeHistory();

    if (!result.success) {
      reportStorageError(result.error);
      return false;
    }

    refreshStatistics();
    return true;
  }, [refreshStatistics, reportStorageError]);

  return {
    statistics,
    mistakeStatistics,
    mistakePatterns,
    sessions,
    attempts,
    hasAttempts,
    hasSessions,
    hasMistakes,
    resetStatistics,
    refreshStatistics,
  };
}
