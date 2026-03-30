import type { QuestionCategory } from '../types/questions';
import { CategoryFilterModal } from './CategoryFilterModal';
import { Hero } from './Hero';
import { HomeFooter } from './HomeFooter';

type IntroScreenProps = {
  usedCount: number;
  total: number;
  version: string;
  activeFilterSummary: string;
  isFilterModalOpen: boolean;
  modalCategories: QuestionCategory[];
  onStart: () => void;
  onReset: () => void;
  onOpenFilters: () => void;
  onToggleCategory: (category: QuestionCategory) => void;
  onSelectAllCategories: () => void;
  onStartFilteredRound: () => void;
  onCloseFilterModal: () => void;
};

export function IntroScreen({
  usedCount,
  total,
  version,
  activeFilterSummary,
  isFilterModalOpen,
  modalCategories,
  onStart,
  onReset,
  onOpenFilters,
  onToggleCategory,
  onSelectAllCategories,
  onStartFilteredRound,
  onCloseFilterModal,
}: IntroScreenProps) {
  return (
    <>
      <Hero
        usedCount={usedCount}
        total={total}
        onStart={onStart}
        onReset={onReset}
        onOpenFilters={onOpenFilters}
        activeFilterSummary={activeFilterSummary}
      />
      <CategoryFilterModal
        isOpen={isFilterModalOpen}
        selectedCategories={modalCategories}
        onToggleCategory={onToggleCategory}
        onSelectAll={onSelectAllCategories}
        onConfirm={onStartFilteredRound}
        onClose={onCloseFilterModal}
      />
      <aside className="tips" data-testid="intro-tips">
        <img className="tips__asset" src="/assets/rose-wave.svg" alt="Romantische Illustration" />
        <div>
          <h2>Kleine Idee für eure Runde</h2>
          <p>
            Lest die Frage laut vor, nehmt euch kurz Zeit und beantwortet sie nacheinander.
            So entsteht aus jeder Karte ein ruhiger, persönlicher Moment.
          </p>
        </div>
      </aside>
      <HomeFooter version={version} />
    </>
  );
}
