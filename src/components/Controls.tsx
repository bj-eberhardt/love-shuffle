import React from 'react';

export function Controls({ onShuffle, onBack, disableShuffle, disableBack }: { onShuffle: () => void; onBack: () => void; disableShuffle?: boolean; disableBack?: boolean }) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 18 }}>
      <div className="actions" style={{ maxWidth: 420 }}>
        <button
          className="button button--primary"
          type="button"
          onClick={() => { if (!disableShuffle) onShuffle(); }}
          disabled={disableShuffle}
          aria-disabled={disableShuffle}
        >
          Shuffle
        </button>
        <button
          className="button button--ghost"
          type="button"
          onClick={() => { if (!disableBack) onBack(); }}
          disabled={disableBack}
          aria-disabled={disableBack}
        >
          Zurück
        </button>
      </div>
    </div>
  );
}
