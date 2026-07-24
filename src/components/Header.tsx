import { getPublicAssetUrl } from '../utils/assets';

export function Header({
  status,
  filterSummary,
  onEnd,
}: {
  status?: string;
  filterSummary?: string;
  onEnd: () => void;
}) {
  return (
    <header className="app-bar" role="banner" data-testid="questions-header">
      <div className="app-bar__content">
        <div className="app-bar__brand">
          <img className="app-bar__logo" src={getPublicAssetUrl('assets/logo-loveshuffle-white.png')} alt="" />
        </div>
        <small className="app-bar__status" data-testid="status-message">{status}</small>
        <small className="app-bar__filters" data-testid="filter-summary">{filterSummary}</small>
      </div>
      <div className="app-bar__actions">
        <button className="button button--ghost app-bar__end-button" type="button" onClick={onEnd} data-testid="end-round-button">
          Beenden
        </button>
      </div>
    </header>
  );
}
