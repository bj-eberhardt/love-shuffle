import React from 'react';

export function Controls({
  onShuffle,
  onSkip,
  onBack,
  onForward,
  disableShuffle,
  showSkip,
  showBack,
  showForward,
}: {
  onShuffle: () => void;
  onSkip: () => void;
  onBack: () => void;
  onForward: () => void;
  disableShuffle?: boolean;
  showSkip?: boolean;
  showBack?: boolean;
  showForward?: boolean;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 18 }} data-testid="question-controls">
      <div className="actions" style={{ maxWidth: 520 }}>
        <button
          className="button button--primary actions__button actions__button--shuffle"
          type="button"
          onClick={() => { if (!disableShuffle) onShuffle(); }}
          disabled={disableShuffle}
          aria-disabled={disableShuffle}
          data-testid="shuffle-button"
        >
          Shuffle
        </button>
        {showSkip && (
          <button
            className="button button--ghost actions__button actions__button--skip"
            type="button"
            onClick={onSkip}
            data-testid="skip-button"
          >
            Überspringen
          </button>
        )}
        {showBack && (
          <button
            className="button button--ghost actions__button actions__button--back"
            type="button"
            onClick={onBack}
            data-testid="back-button"
          >
            Zurück
          </button>
        )}
        {showForward && (
          <button
            className="button button--ghost actions__button actions__button--forward"
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
