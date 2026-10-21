import type { DifficultyLevel, MathOperation, SessionLength } from '../types';

export const ALL_MATH_OPERATIONS: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

export const OPERATION_OPTIONS: {
  value: MathOperation;
  label: string;
  symbol: string;
}[] = [
  { value: 'addition', label: 'Addition', symbol: '+' },
  { value: 'subtraction', label: 'Subtraction', symbol: '−' },
  { value: 'multiplication', label: 'Multiplication', symbol: '×' },
  { value: 'division', label: 'Division', symbol: '÷' },
];

export const DIFFICULTY_OPTIONS: {
  value: DifficultyLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 1,
    label: 'Beginner',
    description: 'Small numbers — great for warming up!',
  },
  {
    value: 2,
    label: 'Easy',
    description: 'Numbers up to 50 with friendly problems.',
  },
  {
    value: 3,
    label: 'Intermediate',
    description: 'Bigger numbers and carrying or borrowing.',
  },
  {
    value: 4,
    label: 'Advanced',
    description: 'Multi-digit problems for math champions!',
  },
];

export const SESSION_LENGTH_OPTIONS: {
  value: SessionLength;
  label: string;
}[] = [
  { value: 5, label: '5 questions' },
  { value: 10, label: '10 questions' },
  { value: 20, label: '20 questions' },
  { value: 'continuous', label: 'Continuous practice' },
];

export function formatOperations(operations: MathOperation[]): string {
  return operations
    .map(
      (operation) =>
        OPERATION_OPTIONS.find((option) => option.value === operation)?.label ??
        operation,
    )
    .join(', ');
}

export function formatDifficulty(level: DifficultyLevel): string {
  return (
    DIFFICULTY_OPTIONS.find((option) => option.value === level)?.label ??
    `Level ${level}`
  );
}

export function formatSessionLength(length: SessionLength): string {
  return (
    SESSION_LENGTH_OPTIONS.find((option) => option.value === length)?.label ??
    String(length)
  );
}
