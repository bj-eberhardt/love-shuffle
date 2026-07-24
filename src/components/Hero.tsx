import { getPublicAssetUrl } from '../utils/assets';

export function Hero({
  cardQuestion,
  usedCount,
  total,
  onStart,
  onReset,
  onOpenFilters,
  activeFilterSummary,
}: {
  cardQuestion?: string;
  usedCount: number;
  total: number;
  onStart: () => void;
  onReset: () => void;
  onOpenFilters: () => void;
  activeFilterSummary: string;
}) {
  return (
    <section className="hero" data-testid="hero">
      <img className="hero__logo" src={getPublicAssetUrl('assets/logo-loveshuffle-white.png')} alt="Love Shuffle" />
      {cardQuestion && <p className="hero__card-question" aria-hidden="true">{cardQuestion}</p>}
      <h1>
        <span className="hero__headline-small">Kleine Fragen.</span>
        <span className="hero__headline-large">Große Verbindung.</span>
      </h1>
      <p className="hero__copy">
        Über 90 romantische Paarfragen, die euch näher zusammenbringen.
      </p>

      <div className="hero__split-row" data-testid="hero-actions">
        <div className="split-button" data-testid="start-split-button">
          <div className="split-button__surface">
            <button className="split-button__main" type="button" onClick={onStart} data-testid="start-round-button">
              Starte die Fragenrunde
            </button>
            <button
              className="split-button__toggle"
              type="button"
              aria-label="Fragen filtern"
              title="Fragen filtern"
              onClick={onOpenFilters}
              data-testid="open-start-menu-button"
            >
              <span className="split-button__shuffle-mark" aria-hidden="true" />
            </button>
          </div>
        </div>
        <button className="button button--ghost" type="button" onClick={onReset} data-testid="reset-used-button">
          Fragen zurücksetzen
        </button>
      </div>

      {activeFilterSummary !== 'Alle Themen aktiv' && (
        <p className="hero__filter-summary" data-testid="hero-filter-summary">
          {activeFilterSummary}
        </p>
      )}

      <div className="hero__progress" data-testid="hero-progress">
        <small>{usedCount} von {total} Fragen gespielt</small>
      </div>
    </section>
  );
}
