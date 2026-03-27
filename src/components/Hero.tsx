export function Hero({
  usedCount,
  total,
  onStart,
  onReset,
  onOpenFilters,
  activeFilterSummary,
}: {
  usedCount: number;
  total: number;
  onStart: () => void;
  onReset: () => void;
  onOpenFilters: () => void;
  activeFilterSummary: string;
}) {
  return (
    <section className="hero" data-testid="hero">
      <img className="hero__icon" src="/assets/heart-badge.svg" alt="Herz Symbol" />
      <p className="hero__eyebrow">Love Shuffle</p>
      <h1>Fragen für Nähe, Liebe und ehrliche Gefühle</h1>
      <p className="hero__copy">
        Ziehe mit einem Klick eine neue Herzensfrage und entdeckt
        gemeinsam zärtliche, ehrliche Gespräche.
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
              <span className="split-button__chevron" aria-hidden="true" />
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

      <div style={{ marginTop: 12 }} data-testid="hero-progress">
        <small>{usedCount} von {total} Fragen gespielt</small>
      </div>
    </section>
  );
}
