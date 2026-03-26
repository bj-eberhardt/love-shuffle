import React from 'react';

export function Controls({
  onShuffle,
  onBack,
  onForward,
  disableShuffle,
  showBack,
  showForward,
}: {
  onShuffle: () => void;
  onBack: () => void;
  onForward: () => void;
  disableShuffle?: boolean;
  showBack?: boolean;
  showForward?: boolean;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 18 }} data-testid="question-controls">
      <div className="actions" style={{ maxWidth: 520 }}>
        <button
          className="button button--primary"
          type="button"
          onClick={() => { if (!disableShuffle) onShuffle(); }}
          disabled={disableShuffle}
          aria-disabled={disableShuffle}
          data-testid="shuffle-button"
        >
          Shuffle
        </button>
        {showBack && (
          <button
            className="button button--ghost"
            type="button"
            onClick={onBack}
            data-testid="back-button"
          >
            Zurück
          </button>
        )}
        {showForward && (
          <button
            className="button button--ghost"
            type="button"
            onClick={onForward}
            data-testid="forward-button"
          >
            Weiter
          </button>
        )}
      </div>
    </div>
  );
}
