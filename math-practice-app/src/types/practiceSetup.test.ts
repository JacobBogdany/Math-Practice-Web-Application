import { describe, expect, it } from 'vitest';
import { isValidPracticeSetupConfig } from './practiceSetup';

describe('isValidPracticeSetupConfig', () => {
  it('accepts a valid configuration', () => {
    expect(
      isValidPracticeSetupConfig({
        operations: ['addition'],
        difficulty: 2,
        sessionLength: 10,
      }),
    ).toBe(true);
  });

  it('rejects empty operations', () => {
    expect(
      isValidPracticeSetupConfig({
        operations: [],
        difficulty: 2,
        sessionLength: 10,
      }),
    ).toBe(false);
  });
});
