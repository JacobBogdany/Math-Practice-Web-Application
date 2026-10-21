import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../context/useAppSettings';
import {
  saveAttempt,
  saveSession,
} from '../services/storage/practiceDataStore';
import {
  generateQuestionFromOperations,
  getQuestionSignature,
} from '../services/questionGenerator';
import type {
  PracticeAttempt,
  PracticeSession,
  Question,
  SessionSummaryState,
} from '../types';
import { createId } from '../utils/ids';
import { isFixedSessionComplete } from '../utils/sessionCompletion';
import type { PracticeSetupConfig } from '../types/practiceSetup';

const MAX_RECENT_SIGNATURES = 12;
const TRANSITION_MS = 180;

interface PracticeSessionState {
  session: PracticeSession;
  currentQuestion: Question;
  currentQuestionIndex: number;
  attempts: PracticeAttempt[];
  recentQuestionSignatures: string[];
  isActive: boolean;
  isTransitioning: boolean;
  shouldFinish: boolean;
}

type PracticeSessionAction =
  | {
      type: 'RECORD_RESULT';
      question: Question;
      selectedAnswer: number;
      selfReportedCorrect: boolean;
    }
  | { type: 'REQUEST_END_SESSION' }
  | { type: 'CLEAR_TRANSITION' };

function createInitialSession(config: PracticeSetupConfig): PracticeSession {
  return {
    id: createId('session'),
    startedAt: new Date().toISOString(),
    operations: config.operations,
    difficulty: config.difficulty,
    sessionLength: config.sessionLength,
    attempted: 0,
    correct: 0,
    incorrect: 0,
  };
}

function createInitialQuestion(config: PracticeSetupConfig): Question {
  return generateQuestionFromOperations(config.operations, config.difficulty);
}

function practiceSessionReducer(
  state: PracticeSessionState,
  action: PracticeSessionAction,
): PracticeSessionState {
  switch (action.type) {
    case 'RECORD_RESULT': {
      const attempt: PracticeAttempt = {
        id: createId('attempt'),
        questionId: action.question.id,
        operation: action.question.operation,
        firstOperand: action.question.firstOperand,
        secondOperand: action.question.secondOperand,
        correctAnswer: action.question.correctAnswer,
        selectedAnswer: action.selectedAnswer,
        selfReportedCorrect: action.selfReportedCorrect,
        difficulty: action.question.difficulty,
        source: action.question.source,
        attemptedAt: new Date().toISOString(),
        sessionId: state.session.id,
      };

      const updatedSession: PracticeSession = {
        ...state.session,
        attempted: state.session.attempted + 1,
        correct: state.session.correct + (action.selfReportedCorrect ? 1 : 0),
        incorrect:
          state.session.incorrect + (action.selfReportedCorrect ? 0 : 1),
      };

      const recentQuestionSignatures = [
        getQuestionSignature(action.question),
        ...state.recentQuestionSignatures,
      ].slice(0, MAX_RECENT_SIGNATURES);

      if (isFixedSessionComplete(updatedSession)) {
        return {
          ...state,
          session: {
            ...updatedSession,
            completedAt: new Date().toISOString(),
          },
          attempts: [...state.attempts, attempt],
          recentQuestionSignatures,
          isActive: false,
          isTransitioning: false,
          shouldFinish: true,
        };
      }

      const nextQuestion = generateQuestionFromOperations(
        updatedSession.operations,
        updatedSession.difficulty,
        recentQuestionSignatures,
      );

      return {
        ...state,
        session: updatedSession,
        currentQuestion: nextQuestion,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        attempts: [...state.attempts, attempt],
        recentQuestionSignatures,
        isActive: true,
        isTransitioning: true,
        shouldFinish: false,
      };
    }
    case 'REQUEST_END_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          completedAt: new Date().toISOString(),
        },
        isActive: false,
        isTransitioning: false,
        shouldFinish: true,
      };
    case 'CLEAR_TRANSITION':
      return {
        ...state,
        isTransitioning: false,
      };
    default:
      return state;
  }
}

export function usePracticeSession(config: PracticeSetupConfig) {
  const navigate = useNavigate();
  const { reportStorageError } = useAppSettings();
  const initialQuestion = useMemo(
    () => createInitialQuestion(config),
    [config],
  );
  const transitionTimerRef = useRef<number | null>(null);
  const savedAttemptIdsRef = useRef<Set<string>>(new Set());

  const [state, dispatch] = useReducer(practiceSessionReducer, {
    session: createInitialSession(config),
    currentQuestion: initialQuestion,
    currentQuestionIndex: 1,
    attempts: [],
    recentQuestionSignatures: [getQuestionSignature(initialQuestion)],
    isActive: true,
    isTransitioning: false,
    shouldFinish: false,
  });

  useEffect(() => {
    if (!state.shouldFinish) {
      return;
    }

    const summaryState: SessionSummaryState = {
      session: state.session,
      attempts: state.attempts,
    };

    const sessionResult = saveSession(state.session);
    if (!sessionResult.success) {
      reportStorageError(sessionResult.error);
    }

    navigate('/practice/summary', { state: summaryState, replace: true });
  }, [navigate, reportStorageError, state.attempts, state.session, state.shouldFinish]);

  useEffect(() => {
    for (const attempt of state.attempts) {
      if (savedAttemptIdsRef.current.has(attempt.id)) {
        continue;
      }

      const result = saveAttempt(attempt);
      if (!result.success) {
        reportStorageError(result.error);
        continue;
      }

      savedAttemptIdsRef.current.add(attempt.id);
    }
  }, [reportStorageError, state.attempts]);

  useEffect(() => {
    if (!state.isTransitioning) {
      return;
    }

    transitionTimerRef.current = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_TRANSITION' });
    }, TRANSITION_MS);

    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [state.currentQuestion.id, state.isTransitioning]);

  const recordResult = useCallback(
    (
      question: Question,
      selectedAnswer: number,
      selfReportedCorrect: boolean,
    ) => {
      if (!state.isActive) {
        return;
      }

      dispatch({
        type: 'RECORD_RESULT',
        question,
        selectedAnswer,
        selfReportedCorrect,
      });
    },
    [state.isActive],
  );

  const endSession = useCallback(() => {
    if (!state.isActive) {
      return;
    }

    dispatch({ type: 'REQUEST_END_SESSION' });
  }, [state.isActive]);

  const totalQuestions: number | 'continuous' =
    state.session.sessionLength === 'continuous'
      ? 'continuous'
      : state.session.sessionLength;

  return {
    session: state.session,
    currentQuestion: state.currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    attempts: state.attempts,
    isActive: state.isActive,
    isTransitioning: state.isTransitioning,
    totalQuestions,
    isContinuous: state.session.sessionLength === 'continuous',
    recordResult,
    endSession,
  };
}

export { TRANSITION_MS as PRACTICE_TRANSITION_MS };
