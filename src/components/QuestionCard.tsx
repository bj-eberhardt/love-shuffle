import type { Question } from '../types/questions';
import { QUESTION_CATEGORY_META } from '../utils/questionCategories';

type QuestionCardProps = {
  question: Question;
  index: number;
  total: number;
};

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  const meta = QUESTION_CATEGORY_META[question.category];

  return (
    <section className={`question-card ${meta.accentClassName}`} aria-live="polite" data-testid="question-card">
      <div className="question-card__meta" data-testid="question-meta">
        <span className="question-card__category" data-testid="question-category">
          <img className="question-card__category-icon" src={meta.iconSrc} alt="" aria-hidden="true" />
          <span className="question-card__category-label">{meta.label}</span>
        </span>
        <span data-testid="question-position">
          {index + 1} / {total}
        </span>
      </div>

      <div className="question-card__content" key={index} data-testid="question-card-content">
        <p className="question-card__text" data-testid="question-text">{question.text}</p>
      </div>
    </section>
  );
}
