import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a new array with the same items', () => {
    const source = [1, 2, 3, 4, 5];
    const result = shuffle(source);

    expect(result).not.toBe(source);
    expect(result.sort((a, b) => a - b)).toEqual(source);
  });

  it('does not mutate the original array', () => {
    const source = ['a', 'b', 'c'];
    shuffle(source);
    expect(source).toEqual(['a', 'b', 'c']);
  });
});
