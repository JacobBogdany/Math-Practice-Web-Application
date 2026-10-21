import { describe, expect, it } from 'vitest';
import { createId, resetIdCounter } from './ids';

describe('createId', () => {
  it('creates unique ids', () => {
    resetIdCounter();
    const first = createId('question');
    const second = createId('question');

    expect(first).not.toEqual(second);
    expect(first.startsWith('question-')).toBe(true);
  });
});
