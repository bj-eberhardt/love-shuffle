type QuestionCardProps = {
  question: string;
  index: number;
  total: number;
};

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  return (
    <section className="question-card" aria-live="polite" data-testid="question-card">
      <div className="question-card__meta" data-testid="question-meta">
        <span data-testid="question-label">Herzfrage</span>
        <span data-testid="question-position">
          {index + 1} / {total}
        </span>
      </div>

      {/* The inner content is keyed so it remounts on index change */}
      <div className="question-card__content" key={index} data-testid="question-card-content">
        <p className="question-card__text" data-testid="question-text">{question}</p>
      </div>
    </section>
  );
}
