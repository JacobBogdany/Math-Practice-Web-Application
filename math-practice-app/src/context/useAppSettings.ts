import { createContext, useContext } from 'react';
import type { AppSettings } from '../types/settings';
import { DEFAULT_APP_SETTINGS } from '../types/settings';

export interface AppSettingsContextValue {
  settings: AppSettings;
  storageWarning: string | null;
  updateSettings: (updates: Partial<AppSettings>) => void;
  reportStorageError: (
    error: 'unavailable' | 'quota' | 'parse' | undefined,
  ) => void;
  clearStorageWarning: () => void;
}

export const AppSettingsContext =
  createContext<AppSettingsContextValue | null>(null);

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);

  if (!context) {
    return {
      settings: DEFAULT_APP_SETTINGS,
      storageWarning: null,
      updateSettings: () => {},
      reportStorageError: () => {},
      clearStorageWarning: () => {},
    };
  }

  return context;
}
