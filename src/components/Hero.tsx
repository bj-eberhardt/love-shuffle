import React from 'react';

export function Hero({ usedCount, total, onStart, onReset }: { usedCount: number; total: number; onStart: () => void; onReset: () => void; }) {
  return (
    <section className="hero" data-testid="hero">
      <img className="hero__icon" src="/assets/heart-badge.svg" alt="Herz Symbol" />
      <p className="hero__eyebrow">Love Shuffle</p>
      <h1>Fragen für Nähe, Liebe und ehrliche Gefühle</h1>
      <p className="hero__copy">
        Ziehe mit einem Klick eine neue Herzensfrage und entdeckt
        gemeinsam zärtliche, ehrliche Gespräche.
      </p>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: 12, justifyContent: 'center' }} data-testid="hero-actions">
        <button className="button button--primary" type="button" onClick={onStart} data-testid="start-round-button">
          Starte die Fragenrunde
        </button>
        <button className="button button--ghost" type="button" onClick={onReset} data-testid="reset-used-button">
          Fragen zurücksetzen
        </button>
      </div>

      <div style={{ marginTop: 12 }} data-testid="hero-progress">
        <small>{usedCount} von {total} Fragen gespielt</small>
      </div>
    </section>
  );
}
