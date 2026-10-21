import type { DifficultyLevel, MathOperation, Question } from '../../types';
import { generateChoices } from '../distractorGenerator';
import { createId } from '../../utils/ids';

const OPERATION_SYMBOLS: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export interface BuildQuestionBaseParams {
  operation: MathOperation;
  difficulty: DifficultyLevel;
  firstOperand: number;
  secondOperand: number;
  correctAnswer: number;
  allowNegativeChoices: boolean;
}

export function buildQuestionBase({
  operation,
  difficulty,
  firstOperand,
  secondOperand,
  correctAnswer,
  allowNegativeChoices,
}: BuildQuestionBaseParams): Question {
  return {
    id: createId('question'),
    operation,
    firstOperand,
    secondOperand,
    displayText: formatDisplayText(operation, firstOperand, secondOperand),
    correctAnswer,
    choices: generateChoices({
      operation,
      firstOperand,
      secondOperand,
      correctAnswer,
      allowNegativeChoices,
    }),
    difficulty,
    source: 'regular',
  };
}

export function formatDisplayText(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
): string {
  const symbol = OPERATION_SYMBOLS[operation];
  return `${firstOperand} ${symbol} ${secondOperand} = ?`;
}

export function formatSolvedText(question: Question): string {
  const symbol = OPERATION_SYMBOLS[question.operation];
  return `${question.firstOperand} ${symbol} ${question.secondOperand} = ${question.correctAnswer}`;
}

export function formatQuestionProgress(
  questionNumber: number,
  totalQuestions: number | 'continuous',
): string {
  if (totalQuestions === 'continuous') {
    return `Question ${questionNumber}`;
  }
  return `Question ${questionNumber} of ${totalQuestions}`;
}
