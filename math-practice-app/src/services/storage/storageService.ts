export type StorageErrorCode = 'unavailable' | 'quota' | 'parse';

export interface StorageReadResult<T> {
  success: boolean;
  data: T | null;
  error?: StorageErrorCode;
}

export interface StorageWriteResult {
  success: boolean;
  error?: StorageErrorCode;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let storageAdapter: StorageAdapter | null = null;

function getAdapter(): StorageAdapter | null {
  if (storageAdapter) {
    return storageAdapter;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export function setStorageAdapter(adapter: StorageAdapter | null): void {
  storageAdapter = adapter;
}

export function isStorageAvailable(): boolean {
  const adapter = getAdapter();

  if (!adapter) {
    return false;
  }

  const testKey = '__mathPracticeStorageTest__';

  try {
    adapter.setItem(testKey, '1');
    adapter.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function readRawItem(key: string): string | null {
  const adapter = getAdapter();

  if (!adapter) {
    return null;
  }

  try {
    return adapter.getItem(key);
  } catch {
    return null;
  }
}

export function writeRawItem(key: string, value: string): StorageWriteResult {
  const adapter = getAdapter();

  if (!adapter) {
    return { success: false, error: 'unavailable' };
  }

  try {
    adapter.setItem(key, value);
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { success: false, error: 'quota' };
    }

    return { success: false, error: 'unavailable' };
  }
}

export function readJsonItem<T>(key: string): StorageReadResult<T> {
  const rawValue = readRawItem(key);

  if (rawValue === null) {
    return { success: true, data: null };
  }

  try {
    return {
      success: true,
      data: JSON.parse(rawValue) as T,
    };
  } catch {
    return {
      success: false,
      data: null,
      error: 'parse',
    };
  }
}

export function writeJsonItem<T>(key: string, value: T): StorageWriteResult {
  try {
    return writeRawItem(key, JSON.stringify(value));
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

