import { useState } from 'react';
import type { MistakePattern } from '../../types';
import {
  DIFFICULTY_OPTIONS,
  OPERATION_OPTIONS,
} from '../../constants/practiceSetup';
import './MistakeDetailsSection.css';

export interface MistakeDetailsSectionProps {
  patterns: MistakePattern[];
  masteryThreshold?: number;
}

const OPERATION_SYMBOLS: Record<string, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function MistakeDetailsSection({
  patterns,
  masteryThreshold = 3,
}: MistakeDetailsSectionProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'mastered'>('active');

  const activePatterns = patterns.filter((p) => !p.mastered);
  const masteredPatterns = patterns.filter((p) => p.mastered);
  const displayedPatterns =
    activeTab === 'active' ? activePatterns : masteredPatterns;

  return (
    <section
      className="mistake-details-section"
      aria-labelledby="mistake-details-title"
    >
      <div className="mistake-details-section__header">
        <h2
          id="mistake-details-title"
          className="mistake-details-section__title"
        >
          Mistake Details & Mastery
        </h2>
        <div
          className="mistake-details-section__tabs"
          role="tablist"
          aria-label="Mistake pattern categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'active'}
            className={`mistake-details-tab ${
              activeTab === 'active' ? 'mistake-details-tab--active' : ''
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activePatterns.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mastered'}
            className={`mistake-details-tab ${
              activeTab === 'mastered' ? 'mistake-details-tab--active' : ''
            }`}
            onClick={() => setActiveTab('mastered')}
          >
            Mastered ({masteredPatterns.length})
          </button>
        </div>
      </div>

      {displayedPatterns.length === 0 ? (
        <div className="mistake-details-section__empty">
          <p>
            {activeTab === 'active'
              ? 'No active mistakes — great job! Keep up the practice!'
              : 'No mastered mistake patterns yet. Answer similar questions correctly in Mistake Review to achieve mastery!'}
          </p>
        </div>
      ) : (
        <ul className="mistake-details-section__list">
          {displayedPatterns.map((pattern) => {
            const opLabel =
              OPERATION_OPTIONS.find((op) => op.value === pattern.operation)
                ?.label ?? pattern.operation;
            const diffLabel =
              DIFFICULTY_OPTIONS.find((d) => d.value === pattern.difficulty)
                ?.label ?? `Level ${pattern.difficulty}`;
            const symbol =
              OPERATION_SYMBOLS[pattern.operation] ?? pattern.operation;

            return (
              <li key={pattern.id} className="mistake-pattern-card">
                <div className="mistake-pattern-card__header">
                  <span className="mistake-pattern-card__equation">
                    {pattern.firstOperand} {symbol} {pattern.secondOperand} ={' '}
                    {pattern.correctAnswer}
                  </span>
                  <div className="mistake-pattern-card__badges">
                    <span className="mistake-badge mistake-badge--op">
                      {opLabel}
                    </span>
                    <span className="mistake-badge mistake-badge--diff">
                      {diffLabel}
                    </span>
                    {pattern.mastered ? (
                      <span className="mistake-badge mistake-badge--mastered">
                        Mastered ✓
                      </span>
                    ) : (
                      <span className="mistake-badge mistake-badge--active">
                        Needs Practice
                      </span>
                    )}
                  </div>
                </div>

                <div className="mistake-pattern-card__body">
                  <div className="mistake-pattern-card__stat">
                    <span className="mistake-stat-label">Missed</span>
                    <span className="mistake-stat-value">
                      {pattern.incorrectCount} time
                      {pattern.incorrectCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mistake-pattern-card__stat">
                    <span className="mistake-stat-label">Mastery Progress</span>
                    <span className="mistake-stat-value">
                      {pattern.similarCorrectCount} / {masteryThreshold} similar
                      correct
                    </span>
                  </div>
                  <div className="mistake-pattern-card__stat">
                    <span className="mistake-stat-label">Last Missed</span>
                    <span className="mistake-stat-value">
                      {formatDate(pattern.lastIncorrectAt)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
