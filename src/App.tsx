import { useCallback, useMemo, useState } from 'react';
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

  // Shake detection removed: navigation now only via button or Space key

  // Start the round: pick initial question and show question mode
  const startRound = useCallback(async () => {
    if (qm.remainingCount === 0) {
      // If all questions were already played, still switch to questions mode
      // so the congrats view is shown and the user receives feedback.
      setMode('questions');
      setStatusMessage('Du hast alle Fragen durchgespielt. Gut gemacht!');
      setShowHint(false);
      await requestDocumentFullscreen();
      // no device motion
      return;
    }

    // choose first question
    qm.next();
    setMode('questions');
    setStatusMessage('Viel Spaß!');
    await requestDocumentFullscreen();
    // show hint (desktop only controlled via CSS)
    setShowHint(true);
  }, [qm]);

  const endRound = useCallback(() => {
    setMode('intro');
    // Only clear the in-memory history; keep persisted used questions
    qm.resetHistory();
    setStatusMessage('Tippe auf „Shuffle“.');
    setShowHint(false);
  }, [qm]);

  const clearUsed = useCallback(() => {
    // Clear persisted used questions and history
    qm.resetAll();
    setStatusMessage('Fragen wurden zurückgesetzt. Du kannst jetzt neu starten.');
    setShowHint(false);
  }, [qm]);

  const hint = useMemo(() => (showHint ? 'Tipp: Klicke "Shuffle", um zur nächsten Frage zu kommen.' : ''), [showHint]);

  const allPlayed = qm.usedCount >= qm.questions.length || qm.remainingCount === 0;
  const canGoBack = qm.history.length > 1;
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
                <p>Du hast alle Fragen durchgespielt.</p>
                <div className="congrats-actions" data-testid="congrats-actions">
                  <button
                    className="button button--primary"
                    type="button"
                    data-testid="play-again-button"
                    onClick={() => {
                      // reset all persisted answers and immediately start a new round
                      qm.resetAll();
                      // startRound will pull the first question and switch mode
                      void startRound();
                    }}
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
              onBack={() => { qm.prev(); setStatusMessage('Zur vorherigen Frage zurückgekehrt.'); }}
              hint={hint}
              disableShuffle={disableShuffle}
              disableBack={!canGoBack}
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
