type QuestionCardProps = {
  question: string;
  index: number;
  total: number;
};

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  return (
    <section className="question-card" aria-live="polite">
      <div className="question-card__meta">
        <span>Herzfrage</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>

      {/* The inner content is keyed so it remounts on index change */}
      <div className="question-card__content" key={index}>
        <p className="question-card__text">{question}</p>
      </div>
    </section>
  );
}
