import { beforeEach, describe, expect, it } from 'vitest';
import {
  isStorageAvailable,
  readJsonItem,
  readRawItem,
  setStorageAdapter,
  writeJsonItem,
  writeRawItem,
} from './storageService';

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

describe('storageService', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorage());
  });

  it('reads and writes raw items', () => {
    expect(writeRawItem('mathPractice.test', 'value').success).toBe(true);
    expect(readRawItem('mathPractice.test')).toBe('value');
  });

  it('reads and writes JSON items', () => {
    expect(writeJsonItem('mathPractice.test', { count: 3 }).success).toBe(true);

    const result = readJsonItem<{ count: number }>('mathPractice.test');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ count: 3 });
  });

  it('handles invalid JSON when reading', () => {
    writeRawItem('mathPractice.test', '{not-json');

    const result = readJsonItem('mathPractice.test');
    expect(result.success).toBe(false);
    expect(result.error).toBe('parse');
  });

  it('reports unavailable storage when the adapter throws', () => {
    setStorageAdapter({
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {},
    });

    expect(isStorageAvailable()).toBe(false);
    expect(writeRawItem('mathPractice.test', 'value')).toEqual({
      success: false,
      error: 'unavailable',
    });
  });

  it('reports quota errors when storage is full', () => {
    setStorageAdapter({
      getItem: () => null,
      setItem: () => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      },
      removeItem: () => {},
    });

    expect(isStorageAvailable()).toBe(false);
    expect(writeRawItem('mathPractice.test', 'value')).toEqual({
      success: false,
      error: 'quota',
    });
  });
});

