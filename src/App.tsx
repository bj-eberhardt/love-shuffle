import { useCallback, useEffect, useMemo, useState } from 'react';
import useQuestionManager from './hooks/useQuestionManager';
import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { QuestionArea } from './components/QuestionArea';
import { Confetti } from './components/Confetti';
import { HomeFooter } from './components/HomeFooter';
import { requestDocumentFullscreen } from './utils/fullscreen';

export default function App() {
  const qm = useQuestionManager();
  const version = __APP_VERSION__;
  const [mode, setMode] = useState<'intro' | 'questions'>('intro');
  const [statusMessage, setStatusMessage] = useState('Tippe auf „Shuffle“.');
  const [showHint, setShowHint] = useState(false);
  const [restartPending, setRestartPending] = useState(false);

  const beginQuestionRound = useCallback(async () => {
    qm.next();
    setMode('questions');
    setStatusMessage('Viel Spaß!');
    await requestDocumentFullscreen();
    setShowHint(true);
  }, [qm]);

  const startRound = useCallback(async () => {
    if (qm.remainingCount === 0) {
      setMode('questions');
      setStatusMessage('Du hast alle Fragen durchgespielt. Gut gemacht!');
      setShowHint(false);
      await requestDocumentFullscreen();
      return;
    }

    if (qm.history.length > 0) {
      qm.jumpToLatest();
      setMode('questions');
      setStatusMessage('Willkommen zurück!');
      setShowHint(false);
      await requestDocumentFullscreen();
      return;
    }

    await beginQuestionRound();
  }, [beginQuestionRound, qm]);

  const endRound = useCallback(() => {
    setMode('intro');
    setStatusMessage('Tippe auf „Shuffle“.');
    setShowHint(false);
  }, []);

  const clearUsed = useCallback(() => {
    qm.resetAll();
    setStatusMessage('Fragen wurden zurückgesetzt. Du kannst jetzt neu starten.');
    setShowHint(false);
  }, [qm]);

  const restartRound = useCallback(() => {
    qm.resetAll();
    setRestartPending(true);
  }, [qm]);

  useEffect(() => {
    if (!restartPending || qm.remainingCount === 0) return;

    setRestartPending(false);
    void beginQuestionRound();
  }, [beginQuestionRound, qm.remainingCount, restartPending]);

  const hint = useMemo(() => (showHint ? 'Tipp: Klicke "Shuffle", um zur nächsten Frage zu kommen.' : ''), [showHint]);

  const allPlayed = qm.usedCount >= qm.questions.length || qm.remainingCount === 0;
  const canGoBack = qm.historyPointer > 0;
  const canGoForward = qm.historyPointer >= 0 && qm.historyPointer < qm.history.length - 1;
  const disableShuffle = qm.remainingCount === 0;

  return (
    <main className={`app-shell ${mode === 'questions' ? 'mode-questions' : ''}`} data-testid="app-shell" data-mode={mode}>
      <div className="decor decor--left" aria-hidden="true" />
      <div className="decor decor--right" aria-hidden="true" />

      {mode === 'intro' && (
        <Hero usedCount={qm.usedCount} total={qm.questions.length} onStart={startRound} onReset={clearUsed} />
      )}

      {mode === 'questions' && (
        <>
          <Header title="Love Shuffle" status={statusMessage} onEnd={endRound} />
          {allPlayed ? (
            <div className="question-area" style={{ position: 'relative' }} data-testid="all-played-view">
              <div className="congrats-card" data-testid="congrats-card">
                <img src="/assets/heart-badge.svg" className="congrats-card__asset" alt="Erfolg" />
                <h2>Glückwunsch!</h2>
                <p data-testid="congrats-message">Du hast alle Fragen durchgespielt.</p>
                <div className="congrats-actions" data-testid="congrats-actions">
                  <button
                    className="button button--primary"
                    type="button"
                    data-testid="play-again-button"
                    onClick={() => { restartRound(); }}
                  >
                    Nochmal spielen
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => endRound()} data-testid="congrats-back-button">
                    Zurück
                  </button>
                </div>
              </div>
              <Confetti />
            </div>
          ) : (
            <QuestionArea
              question={qm.currentQuestion}
              index={qm.currentIndex}
              total={qm.questions.length}
              onShuffle={() => { qm.next(); setStatusMessage('Neue Frage per Shuffle ausgewählt.'); setShowHint(false); }}
              onBack={() => { qm.prev(); setStatusMessage('Zur vorherigen Frage zurückgekehrt.'); setShowHint(false); }}
              onForward={() => { qm.forward(); setStatusMessage('Zur neueren Frage weitergegangen.'); setShowHint(false); }}
              hint={hint}
              disableShuffle={disableShuffle}
              showBack={canGoBack}
              showForward={canGoForward}
            />
          )}
        </>
      )}

      {mode === 'intro' && (
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
      )}

      {mode === 'intro' && <HomeFooter version={version} />}
    </main>
  );
}
