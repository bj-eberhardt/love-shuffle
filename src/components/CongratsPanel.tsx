import React from 'react';
import type { QuestionCategory } from '../types/questions';
import { QUESTION_CATEGORY_META } from '../utils/questionCategories';

function renderHighlightedCategoryLabels(categories: QuestionCategory[]) {
  const labels = categories.map((category) => QUESTION_CATEGORY_META[category].label);

  return labels.map((label, index) => {
    const prefix = index === 0
      ? ''
      : index === labels.length - 1
        ? ' und '
        : ', ';

    return (
      <span key={label}>
        {prefix}
        <span className="congrats-card__categories">{label}</span>
      </span>
    );
  });
}

type CongratsPanelProps = {
  activeCategories: QuestionCategory[];
  allQuestionsPlayed: boolean;
  playAgainLabel: string;
  onPlayAgain: () => void;
};

export function CongratsPanel({
  activeCategories,
  allQuestionsPlayed,
  playAgainLabel,
  onPlayAgain,
}: CongratsPanelProps) {
  return (
    <div className="congrats-card" data-testid="congrats-card">
      <img src="/assets/heart-badge.svg" className="congrats-card__asset" alt="Erfolg" />
      <h2>Glückwunsch!</h2>
      <p data-testid="congrats-message">
        {allQuestionsPlayed ? (
          'Du hast das komplette Spiel durchgespielt.'
        ) : (
          <>
            Du hast <span data-testid="congrats-categories">{renderHighlightedCategoryLabels(activeCategories)}</span> durchgespielt.
          </>
        )}
      </p>
      <div className="congrats-actions" data-testid="congrats-actions">
        <button
          className="button button--primary"
          type="button"
          data-testid="play-again-button"
          onClick={onPlayAgain}
        >
          {playAgainLabel}
        </button>
      </div>
    </div>
  );
}
