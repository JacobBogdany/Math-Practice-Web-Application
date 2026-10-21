import type { DifficultyLevel, MathOperation } from './question';
import type { ReviewMode, SessionLength } from './session';

export interface PracticeSetupConfig {
  operations: MathOperation[];
  difficulty: DifficultyLevel;
  sessionLength: SessionLength;
  mode?: ReviewMode;
}

const ALL_OPERATIONS: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

export function isValidPracticeSetupConfig(
  value: unknown,
): value is PracticeSetupConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const config = value as PracticeSetupConfig;

  return (
    Array.isArray(config.operations) &&
    config.operations.length > 0 &&
    config.operations.every((operation) =>
      ALL_OPERATIONS.includes(operation),
    ) &&
    [1, 2, 3, 4].includes(config.difficulty) &&
    ([5, 10, 20, 'continuous'] as SessionLength[]).includes(
      config.sessionLength,
    ) &&
    (config.mode === undefined ||
      config.mode === 'regular' ||
      config.mode === 'mistake-review')
  );
}
