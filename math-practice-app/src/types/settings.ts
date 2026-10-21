import type { DifficultyLevel, MathOperation } from './question';
import type { SessionLength } from './session';

export interface AppSettings {
  soundEffectsEnabled: boolean;
  cardAnimationEnabled: boolean;
  showExplanations: boolean;
  defaultSessionLength: SessionLength;
  defaultDifficulty: DifficultyLevel;
  defaultOperations: MathOperation[];
  masteryThreshold: number;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  soundEffectsEnabled: true,
  cardAnimationEnabled: true,
  showExplanations: true,
  defaultSessionLength: 10,
  defaultDifficulty: 2,
  defaultOperations: ['addition', 'subtraction', 'multiplication', 'division'],
  masteryThreshold: 3,
};
