import type { QuestionCategory } from '../types/questions';
import { QUESTION_CATEGORY_META, QUESTION_CATEGORY_ORDER } from '../utils/questionCategories';

type CategorySelectorProps = {
  selectedCategories: QuestionCategory[];
  onToggleCategory: (category: QuestionCategory) => void;
  onSelectAll: () => void;
};

export function CategorySelector({
  selectedCategories,
  onToggleCategory,
  onSelectAll,
}: CategorySelectorProps) {
  return (
    <section className="category-selector" data-testid="category-selector">
      <div className="category-selector__header">
        <button
          className="category-selector__all"
          type="button"
          onClick={onSelectAll}
          data-testid="select-all-categories-button"
        >
          Alle aktivieren
        </button>
      </div>

      <div className="category-selector__grid">
        {QUESTION_CATEGORY_ORDER.map((category) => {
          const meta = QUESTION_CATEGORY_META[category];
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              className={`category-chip ${meta.accentClassName} ${isSelected ? 'is-selected' : ''}`}
              type="button"
              onClick={() => onToggleCategory(category)}
              aria-pressed={isSelected}
              data-testid={`category-chip-${category}`}
            >
              <img className="category-chip__icon" src={meta.iconSrc} alt="" aria-hidden="true" />
              <span className="category-chip__label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
