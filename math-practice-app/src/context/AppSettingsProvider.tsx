import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadSettings,
  saveSettings,
} from '../services/storage/practiceDataStore';
import type { AppSettings } from '../types/settings';
import {
  AppSettingsContext,
  type AppSettingsContextValue,
} from './useAppSettings';

const STORAGE_WARNING_MESSAGES = {
  unavailable:
    'Your progress cannot be saved right now because browser storage is unavailable.',
  quota: 'Your progress cannot be saved because browser storage is full.',
  parse: 'Some saved data was invalid and has been reset to safe defaults.',
} as const;

function getStorageWarningMessage(
  error: 'unavailable' | 'quota' | 'parse' | undefined,
): string | null {
  if (!error) {
    return null;
  }

  return STORAGE_WARNING_MESSAGES[error];
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((current) => {
      const nextSettings = { ...current, ...updates };
      const result = saveSettings(nextSettings);

      if (!result.success) {
        setStorageWarning(getStorageWarningMessage(result.error));
      }

      return nextSettings;
    });
  }, []);

  const reportStorageError = useCallback(
    (error: 'unavailable' | 'quota' | 'parse' | undefined) => {
      const message = getStorageWarningMessage(error);
      if (message) {
        setStorageWarning(message);
      }
    },
    [],
  );

  const clearStorageWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      storageWarning,
      updateSettings,
      reportStorageError,
      clearStorageWarning,
    }),
    [settings, storageWarning, updateSettings, reportStorageError, clearStorageWarning],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}
