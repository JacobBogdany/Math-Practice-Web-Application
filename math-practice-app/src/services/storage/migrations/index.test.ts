import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storageKeys';
import {
  CURRENT_SCHEMA_VERSION,
  readStoredSchemaVersion,
  runStorageMigrations,
} from './index';
import {
  readJsonItem,
  readRawItem,
  setStorageAdapter,
} from '../storageService';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('storage migrations', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
  });

  it('stores the current schema version', () => {
    runStorageMigrations();

    expect(readStoredSchemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
    expect(readJsonItem(STORAGE_KEYS.version).data).toEqual({
      version: CURRENT_SCHEMA_VERSION,
    });
  });

  it('preserves unrelated stored data during migration', () => {
    const adapter = new MemoryStorage();
    setStorageAdapter(adapter);
    adapter.setItem(STORAGE_KEYS.settings, JSON.stringify({ saved: true }));

    runStorageMigrations();

    expect(readRawItem(STORAGE_KEYS.settings)).toBe(
      JSON.stringify({ saved: true }),
    );
  });
});
