import { describe, expect, it } from 'vitest';
import { randomInt } from './math';

describe('randomInt', () => {
  it('returns integers within the inclusive range', () => {
    for (let index = 0; index < 50; index += 1) {
      const value = randomInt(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('throws when min is greater than max', () => {
    expect(() => randomInt(5, 2)).toThrow(RangeError);
  });
});
