import type { Question, QuestionCategory } from '../types/questions';

type QuestionCardProps = {
  question: Question;
  index: number;
  total: number;
};

const categoryMeta: Record<QuestionCategory, { label: string; iconSrc: string; className: string }> = {
  'sex-intimitaet': {
    label: 'Sex & Intimität',
    iconSrc: '/assets/category-sex-intimitaet.svg',
    className: 'question-card--sex-intimitaet',
  },
  'verbundenheit-wachstum': {
    label: 'Verbundenheit & Wachstum',
    iconSrc: '/assets/category-verbundenheit-wachstum.svg',
    className: 'question-card--verbundenheit-wachstum',
  },
  erinnerungen: {
    label: 'Erinnerungen',
    iconSrc: '/assets/category-erinnerungen.svg',
    className: 'question-card--erinnerungen',
  },
  beziehung: {
    label: 'Beziehung',
    iconSrc: '/assets/category-beziehung.svg',
    className: 'question-card--beziehung',
  },
  'ueber-dich': {
    label: 'Über dich',
    iconSrc: '/assets/category-ueber-dich.svg',
    className: 'question-card--ueber-dich',
  },
};

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  const meta = categoryMeta[question.category];

  return (
    <section className={`question-card ${meta.className}`} aria-live="polite" data-testid="question-card">
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
