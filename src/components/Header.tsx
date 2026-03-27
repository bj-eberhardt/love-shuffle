export function Header({
  title,
  status,
  filterSummary,
  onEnd,
}: {
  title?: string;
  status?: string;
  filterSummary?: string;
  onEnd: () => void;
}) {
  return (
    <header className="app-bar" role="banner" data-testid="questions-header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/assets/heart-badge.svg" alt="" style={{ width: 34, height: 34 }} />
          <strong data-testid="questions-header-title">{title ?? 'Love Shuffle'}</strong>
        </div>
        <small className="app-bar__status" data-testid="status-message">{status}</small>
        <small className="app-bar__filters" data-testid="filter-summary">{filterSummary}</small>
      </div>
      <div>
        <button className="button button--ghost" type="button" onClick={onEnd} data-testid="end-round-button">
          Beenden
        </button>
      </div>
    </header>
  );
}
