import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../context/useAppSettings';
import {
  clearActivePracticeSession,
  loadActivePracticeSession,
  loadMistakePatterns,
  recordAttemptMistake,
  recordMistakeReviewResult,
  saveActivePracticeSession,
  saveAttempt,
  saveSession,
} from '../services/storage/practiceDataStore';
import {
  generateQuestionFromOperations,
  getQuestionSignature,
} from '../services/questionGenerator';
import { generateSimilarQuestion } from '../services/similarQuestionGenerator';
import {
  getActiveMistakePatterns,
  prioritizeMistakePatterns,
} from '../services/mistakePriority';
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
      masteryThreshold: number;
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
    mode: config.mode ?? 'regular',
    attempted: 0,
    correct: 0,
    incorrect: 0,
  };
}

function getNextQuestionForSession(
  config: PracticeSetupConfig,
  recentSignatures: string[],
): Question {
  if (config.mode === 'mistake-review') {
    const allPatterns = loadMistakePatterns();
    const activePatterns = getActiveMistakePatterns(allPatterns);

    if (activePatterns.length > 0) {
      const prioritized = prioritizeMistakePatterns(activePatterns);

      for (const pattern of prioritized) {
        const question = generateSimilarQuestion(pattern);
        const sig = getQuestionSignature(question);
        if (!recentSignatures.includes(sig)) {
          return question;
        }
      }

      return generateSimilarQuestion(prioritized[0]);
    }
  }

  return generateQuestionFromOperations(
    config.operations,
    config.difficulty,
    recentSignatures,
  );
}

function createInitialQuestion(config: PracticeSetupConfig): Question {
  return getNextQuestionForSession(config, []);
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
        mistakePatternId: action.question.mistakePatternId,
        attemptedAt: new Date().toISOString(),
        sessionId: state.session.id,
      };

      if (
        action.question.source === 'mistake-review' &&
        action.question.mistakePatternId
      ) {
        recordMistakeReviewResult(
          action.question.mistakePatternId,
          action.selfReportedCorrect,
          action.masteryThreshold,
        );
      } else if (
        action.question.source === 'regular' &&
        !action.selfReportedCorrect
      ) {
        recordAttemptMistake(attempt);
      }

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

      const nextQuestion = getNextQuestionForSession(
        {
          operations: updatedSession.operations,
          difficulty: updatedSession.difficulty,
          sessionLength: updatedSession.sessionLength,
          mode: updatedSession.mode,
        },
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

function initPracticeSessionState(
  config: PracticeSetupConfig,
): PracticeSessionState {
  const saved = loadActivePracticeSession();
  const currentMode = config.mode ?? 'regular';

  if (
    saved &&
    saved.config &&
    (saved.config.mode ?? 'regular') === currentMode &&
    saved.config.difficulty === config.difficulty &&
    saved.config.sessionLength === config.sessionLength &&
    saved.session &&
    !saved.session.completedAt
  ) {
    return {
      session: saved.session,
      currentQuestion: saved.currentQuestion,
      currentQuestionIndex: saved.currentQuestionIndex,
      attempts: saved.attempts ?? [],
      recentQuestionSignatures: saved.recentQuestionSignatures ?? [],
      isActive: true,
      isTransitioning: false,
      shouldFinish: false,
    };
  }

  const initialQuestion = createInitialQuestion(config);
  return {
    session: createInitialSession(config),
    currentQuestion: initialQuestion,
    currentQuestionIndex: 1,
    attempts: [],
    recentQuestionSignatures: [getQuestionSignature(initialQuestion)],
    isActive: true,
    isTransitioning: false,
    shouldFinish: false,
  };
}

export function usePracticeSession(config: PracticeSetupConfig) {
  const navigate = useNavigate();
  const { settings, reportStorageError } = useAppSettings();
  const transitionTimerRef = useRef<number | null>(null);

  const [state, dispatch] = useReducer(
    practiceSessionReducer,
    config,
    initPracticeSessionState,
  );

  const savedAttemptIdsRef = useRef<Set<string>>(
    new Set(state.attempts.map((attempt) => attempt.id)),
  );

  useEffect(() => {
    if (state.isActive && !state.shouldFinish) {
      saveActivePracticeSession({
        config,
        session: state.session,
        currentQuestion: state.currentQuestion,
        currentQuestionIndex: state.currentQuestionIndex,
        attempts: state.attempts,
        recentQuestionSignatures: state.recentQuestionSignatures,
      });
    }
  }, [
    config,
    state.attempts,
    state.currentQuestion,
    state.currentQuestionIndex,
    state.isActive,
    state.recentQuestionSignatures,
    state.session,
    state.shouldFinish,
  ]);

  useEffect(() => {
    if (!state.isActive || state.shouldFinish) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isActive, state.shouldFinish]);

  useEffect(() => {
    if (!state.shouldFinish) {
      return;
    }

    clearActivePracticeSession();

    const summaryState: SessionSummaryState = {
      session: state.session,
      attempts: state.attempts,
    };

    const sessionResult = saveSession(state.session);
    if (!sessionResult.success) {
      reportStorageError(sessionResult.error);
    }

    navigate('/practice/summary', { state: summaryState, replace: true });
  }, [
    navigate,
    reportStorageError,
    state.attempts,
    state.session,
    state.shouldFinish,
  ]);

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
        masteryThreshold: settings.masteryThreshold,
      });
    },
    [settings.masteryThreshold, state.isActive],
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
