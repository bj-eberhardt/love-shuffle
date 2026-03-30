import { useCallback, useEffect, useMemo, useState } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { QuestionScreen } from './components/QuestionScreen';
import useQuestionManager from './hooks/useQuestionManager';
import type { QuestionCategory } from './types/questions';
import { requestDocumentFullscreen } from './utils/fullscreen';
import { getCategorySummary, QUESTION_CATEGORY_ORDER } from './utils/questionCategories';

function haveSameCategories(a: QuestionCategory[], b: QuestionCategory[]) {
  return a.length === b.length && a.every((category, index) => category === b[index]);
}

export default function App() {
  const [activeCategories, setActiveCategories] = useState<QuestionCategory[]>(QUESTION_CATEGORY_ORDER);
  const [modalCategories, setModalCategories] = useState<QuestionCategory[]>([]);
  const [lastPlayedCategories, setLastPlayedCategories] = useState<QuestionCategory[]>(QUESTION_CATEGORY_ORDER);
  const [pendingStartCategories, setPendingStartCategories] = useState<QuestionCategory[] | null>(null);
  const [mode, setMode] = useState<'intro' | 'questions'>('intro');
  const [statusMessage, setStatusMessage] = useState('Tippe auf „Shuffle“.');
  const [showHint, setShowHint] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [restartPending, setRestartPending] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const qm = useQuestionManager(activeCategories);
  const version = __APP_VERSION__;

  const activeFilterSummary = useMemo(() => getCategorySummary(activeCategories), [activeCategories]);

  const beginQuestionRound = useCallback(async () => {
    qm.next();
    setMode('questions');
    setShowCongrats(false);
    setIsSkipModalOpen(false);
    setLastPlayedCategories(activeCategories);
    setStatusMessage('Viel Spaß!');
    await requestDocumentFullscreen();
    setShowHint(true);
  }, [activeCategories, qm]);

  const startRound = useCallback(async () => {
    if (qm.remainingCount === 0) {
      setMode('questions');
      setShowCongrats(true);
      setIsSkipModalOpen(false);
      setStatusMessage('Du hast alle Fragen durchgespielt. Gut gemacht!');
      setShowHint(false);
      await requestDocumentFullscreen();
      return;
    }

    if (qm.historyCountInSelection > 0 && haveSameCategories(activeCategories, lastPlayedCategories)) {
      qm.jumpToLatestInSelection();
      setMode('questions');
      setShowCongrats(false);
      setIsSkipModalOpen(false);
      setLastPlayedCategories(activeCategories);
      setStatusMessage('Willkommen zurück!');
      setShowHint(false);
      await requestDocumentFullscreen();
      return;
    }

    await beginQuestionRound();
  }, [activeCategories, beginQuestionRound, lastPlayedCategories, qm]);

  const endRound = useCallback(() => {
    qm.clearSkippedSession();
    setMode('intro');
    setActiveCategories(QUESTION_CATEGORY_ORDER);
    setModalCategories([]);
    setShowCongrats(false);
    setIsSkipModalOpen(false);
    setStatusMessage('Tippe auf „Shuffle“.');
    setShowHint(false);
  }, [qm]);

  const clearUsed = useCallback(() => {
    qm.resetAll();
    setActiveCategories(QUESTION_CATEGORY_ORDER);
    setModalCategories([]);
    setShowCongrats(false);
    setIsSkipModalOpen(false);
    setStatusMessage('Fragen wurden zurückgesetzt. Du kannst jetzt neu starten.');
    setShowHint(false);
  }, [qm]);

  const restartRound = useCallback(() => {
    if (qm.usedCount < qm.playableQuestionCount) {
      setActiveCategories(QUESTION_CATEGORY_ORDER);
      setLastPlayedCategories(QUESTION_CATEGORY_ORDER);
      setPendingStartCategories(QUESTION_CATEGORY_ORDER);
      setModalCategories([]);
      setShowCongrats(false);
      setIsSkipModalOpen(false);
      return;
    }

    qm.resetAll();
    setActiveCategories(QUESTION_CATEGORY_ORDER);
    setLastPlayedCategories(QUESTION_CATEGORY_ORDER);
    setModalCategories([]);
    setShowCongrats(false);
    setIsSkipModalOpen(false);
    setRestartPending(true);
  }, [qm]);

  const toggleCategory = useCallback((category: QuestionCategory) => {
    setModalCategories((prev) => (
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    ));
  }, []);

  const selectAllCategories = useCallback(() => {
    setModalCategories(QUESTION_CATEGORY_ORDER);
  }, []);

  const openFilters = useCallback(() => {
    setModalCategories([]);
    setIsFilterModalOpen(true);
  }, []);

  const startRoundWithCategories = useCallback((categories: QuestionCategory[]) => {
    setActiveCategories(categories);
    setPendingStartCategories(categories);
  }, []);

  const startAllRound = useCallback(() => {
    startRoundWithCategories(QUESTION_CATEGORY_ORDER);
  }, [startRoundWithCategories]);

  const startFilteredRound = useCallback(() => {
    if (modalCategories.length === 0) return;

    setIsFilterModalOpen(false);
    startRoundWithCategories(modalCategories);
  }, [modalCategories, startRoundWithCategories]);

  const completeSkip = useCallback((modeToUse: 'session' | 'permanent') => {
    const result = qm.skipCurrent(modeToUse);
    if (!result || !result.skipped) return;

    setIsSkipModalOpen(false);
    setShowHint(false);

    if (result.hasRemainingAfterSkip) {
      setShowCongrats(false);
      qm.next();
      setStatusMessage(
        modeToUse === 'permanent'
          ? 'Frage für dieses Spiel gesperrt. Eine neue Karte wurde gezogen.'
          : 'Frage nur für heute übersprungen. Eine neue Karte wurde gezogen.',
      );
      return;
    }

    setShowCongrats(true);
    setStatusMessage(
      modeToUse === 'permanent'
        ? 'Frage für dieses Spiel gesperrt. Du hast alle Fragen durchgespielt.'
        : 'Frage nur für heute übersprungen. Du hast alle Fragen durchgespielt.',
    );
  }, [qm]);

  useEffect(() => {
    if (!restartPending || qm.remainingCount === 0) return;

    setRestartPending(false);
    void beginQuestionRound();
  }, [beginQuestionRound, qm.remainingCount, restartPending]);

  useEffect(() => {
    if (pendingStartCategories === null) return;

    const isCurrentFilterReady =
      pendingStartCategories.length === activeCategories.length &&
      pendingStartCategories.every((category, index) => category === activeCategories[index]);

    if (!isCurrentFilterReady) return;

    setPendingStartCategories(null);
    void startRound();
  }, [activeCategories, pendingStartCategories, startRound]);

  const hint = useMemo(() => (
    showHint ? 'Tipp: Klicke "Shuffle", um zur nächsten Frage zu kommen.' : ''
  ), [showHint]);

  const allPlayed = qm.filteredTotalCount > 0 && qm.remainingCount === 0;
  const allQuestionsPlayed = qm.usedCount >= qm.playableQuestionCount;
  const shouldShowCongrats = allPlayed && showCongrats;
  const isPartialFilterComplete =
    !allQuestionsPlayed &&
    activeCategories.length < QUESTION_CATEGORY_ORDER.length &&
    qm.filteredTotalCount > 0 &&
    qm.usedCountInSelection === qm.filteredTotalCount;
  const playAgainLabel = isPartialFilterComplete ? 'Weitere Kategorien spielen' : 'Erneut spielen';
  const canGoBack = qm.historyPointerInSelection > 0;
  const canGoForward = qm.historyPointerInSelection >= 0 && qm.historyPointerInSelection < qm.historyCountInSelection - 1;
  const disableShuffle = shouldShowCongrats;
  const showSkip = !shouldShowCongrats && qm.canSkipCurrent;

  return (
    <main className={`app-shell ${mode === 'questions' ? 'mode-questions' : ''}`} data-testid="app-shell" data-mode={mode}>
      <div className="decor decor--left" aria-hidden="true" />
      <div className="decor decor--right" aria-hidden="true" />

      {mode === 'intro' && (
        <IntroScreen
          usedCount={qm.usedCountInSelection}
          total={qm.filteredTotalCount}
          version={version}
          activeFilterSummary={activeFilterSummary}
          isFilterModalOpen={isFilterModalOpen}
          modalCategories={modalCategories}
          onStart={startAllRound}
          onReset={clearUsed}
          onOpenFilters={openFilters}
          onToggleCategory={toggleCategory}
          onSelectAllCategories={selectAllCategories}
          onStartFilteredRound={startFilteredRound}
          onCloseFilterModal={() => setIsFilterModalOpen(false)}
        />
      )}

      {mode === 'questions' && (
        <QuestionScreen
          statusMessage={statusMessage}
          activeFilterSummary={activeFilterSummary}
          onEnd={endRound}
          shouldShowCongrats={shouldShowCongrats}
          allQuestionsPlayed={allQuestionsPlayed}
          activeCategories={activeCategories}
          playAgainLabel={playAgainLabel}
          onPlayAgain={restartRound}
          question={qm.currentQuestion}
          index={qm.historyPointerInSelection >= 0 ? qm.historyPointerInSelection : undefined}
          total={qm.filteredTotalCount}
          onShuffle={() => {
            if (qm.remainingCount === 0) {
              setShowCongrats(true);
              setIsSkipModalOpen(false);
              setStatusMessage('Du hast alle Fragen durchgespielt. Gut gemacht!');
              setShowHint(false);
              return;
            }

            qm.next();
            setShowCongrats(false);
            setIsSkipModalOpen(false);
            setStatusMessage(qm.remainingCount === 1 ? 'Letzte Frage erreicht.' : 'Neue Frage per Shuffle ausgewählt.');
            setShowHint(false);
          }}
          onBack={() => {
            qm.prev();
            setShowCongrats(false);
            setIsSkipModalOpen(false);
            setStatusMessage('Zur vorherigen Frage zurückgekehrt.');
            setShowHint(false);
          }}
          onSkip={() => {
            setIsSkipModalOpen(true);
          }}
          onForward={() => {
            qm.forward();
            setShowCongrats(false);
            setIsSkipModalOpen(false);
            setStatusMessage('Zur neueren Frage weitergegangen.');
            setShowHint(false);
          }}
          hint={hint}
          disableShuffle={disableShuffle}
          showSkip={showSkip}
          showBack={canGoBack}
          showForward={canGoForward}
          isSkipModalOpen={isSkipModalOpen}
          onSkipForSession={() => completeSkip('session')}
          onSkipPermanently={() => completeSkip('permanent')}
          onCloseSkipModal={() => setIsSkipModalOpen(false)}
        />
      )}
    </main>
  );
}
