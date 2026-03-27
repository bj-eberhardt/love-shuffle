import type { QuestionCategory } from '../types/questions';
import { CategorySelector } from './CategorySelector';

type CategoryFilterModalProps = {
  isOpen: boolean;
  selectedCategories: QuestionCategory[];
  onToggleCategory: (category: QuestionCategory) => void;
  onSelectAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function CategoryFilterModal({
  isOpen,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onConfirm,
  onClose,
}: CategoryFilterModalProps) {
  if (!isOpen) return null;

  const canConfirm = selectedCategories.length > 0;

  return (
    <div className="modal-backdrop" data-testid="category-filter-modal">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="category-filter-title">
        <div className="modal-card__header">
          <div>
            <h2 className="modal-card__title" id="category-filter-title" data-testid="category-filter-title">Kategorien auswählen</h2>
            <p className="modal-card__copy" data-testid="category-filter-copy">Wähle aus, welche Themen heute in eure Runde kommen sollen.</p>
          </div>
          <button className="modal-card__close" type="button" onClick={onClose} data-testid="close-filter-modal-button">
            Schließen
          </button>
        </div>

        <CategorySelector
          selectedCategories={selectedCategories}
          onToggleCategory={onToggleCategory}
          onSelectAll={onSelectAll}
        />

        {!canConfirm && (
          <p className="modal-card__validation" data-testid="modal-category-validation">
            Wähle mindestens eine Kategorie aus, damit du starten kannst.
          </p>
        )}

        <div className="modal-card__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            data-testid="start-filtered-round-button"
          >
            Gefiltert starten
          </button>
        </div>
      </div>
    </div>
  );
}
