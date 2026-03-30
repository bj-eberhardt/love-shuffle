import { useCallback, useMemo, useState } from 'react';
import questions from '../data/questions.json';
import type { Question, QuestionCategory } from '../types/questions';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';
import useLocalStorageSet from './useLocalStorageSet';

function getRandomFromArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useQuestionManager(selectedCategories: QuestionCategory[]) {
  const { set: usedSet, add: addUsed, remove: removeUsed, clear: clearPersisted, size } = useLocalStorageSet('loveShuffle.usedQuestions.v1');
  const { set: blockedSet, add: addBlocked, clear: clearBlocked, size: blockedCount } = useLocalStorageSet('loveShuffle.blockedQuestions.v1');
  const historyStorageKey = 'loveShuffle.history.v1';
  const [skippedSet, setSkippedSet] = useState<Set<number>>(() => new Set());
  const [skipCandidateIndex, setSkipCandidateIndex] = useState<number | null>(null);

  const [history, setHistory] = useState<number[]>(() => {
    const raw = safeGetItem<number[]>(historyStorageKey);
    if (!raw || !Array.isArray(raw)) return [];
    return raw.filter((index) => Number.isInteger(index) && index >= 0 && index < questions.length);
  });

  const [historyPointer, setHistoryPointer] = useState<number>(() => {
    const raw = safeGetItem<number[]>(historyStorageKey);
    return raw && Array.isArray(raw) && raw.length > 0 ? raw.length - 1 : -1;
  });

  const persistHistory = useCallback((nextHistory: number[]) => {
    if (nextHistory.length === 0) {
      safeRemoveItem(historyStorageKey);
      return;
    }

    safeSetItem(historyStorageKey, nextHistory);
  }, [historyStorageKey]);

  const selectableIndices = useMemo(() => {
    return questions
      .map((question, index) => ({ question: question as Question, index }))
      .filter(({ question }) => selectedCategories.includes(question.category))
      .map(({ index }) => index);
  }, [selectedCategories]);

  const selectableIndexSet = useMemo(() => new Set(selectableIndices), [selectableIndices]);

  const remainingIndices = useMemo(() => {
    return selectableIndices.filter((index) => !usedSet.has(index) && !skippedSet.has(index) && !blockedSet.has(index));
  }, [blockedSet, selectableIndices, skippedSet, usedSet]);
  const skippedCountInSelection = useMemo(() => {
    return selectableIndices.filter((index) => skippedSet.has(index)).length;
  }, [selectableIndices, skippedSet]);
  const blockedCountInSelection = useMemo(() => {
    return selectableIndices.filter((index) => blockedSet.has(index)).length;
  }, [blockedSet, selectableIndices]);

  const normalizedPointer = history.length === 0
    ? -1
    : Math.min(Math.max(historyPointer, 0), history.length - 1);

  const currentIndex = normalizedPointer >= 0 ? history[normalizedPointer] : undefined;
  const currentIndexInSelection = typeof currentIndex === 'number' && selectableIndexSet.has(currentIndex);

  const selectionHistoryPositions = useMemo(() => {
    return history.reduce<number[]>((positions, index, position) => {
      if (selectableIndexSet.has(index)) positions.push(position);
      return positions;
    }, []);
  }, [history, selectableIndexSet]);

  const selectionPointer = currentIndexInSelection
    ? selectionHistoryPositions.indexOf(normalizedPointer)
    : -1;
  const canSkipCurrent =
    currentIndexInSelection &&
    selectionPointer === selectionHistoryPositions.length - 1 &&
    currentIndex === skipCandidateIndex;

  const next = useCallback(() => {
    if (remainingIndices.length === 0) return undefined;

    const nextIndex = getRandomFromArray(remainingIndices);
    setHistory((prevHistory) => {
      const nextHistory = [...prevHistory, nextIndex];
      setHistoryPointer(nextHistory.length - 1);
      setSkipCandidateIndex(nextIndex);
      persistHistory(nextHistory);
      return nextHistory;
    });
    addUsed(nextIndex);
    return nextIndex;
  }, [remainingIndices, addUsed, persistHistory]);

  const prev = useCallback(() => {
    if (selectionPointer <= 0) return;
    setHistoryPointer(selectionHistoryPositions[selectionPointer - 1]);
  }, [selectionHistoryPositions, selectionPointer]);

  const forward = useCallback(() => {
    if (selectionPointer < 0 || selectionPointer >= selectionHistoryPositions.length - 1) return;
    setHistoryPointer(selectionHistoryPositions[selectionPointer + 1]);
  }, [selectionHistoryPositions, selectionPointer]);

  const jumpToLatestInSelection = useCallback(() => {
    if (selectionHistoryPositions.length === 0) {
      setSkipCandidateIndex(null);
      setHistoryPointer(-1);
      return false;
    }

    setSkipCandidateIndex(null);
    setHistoryPointer(selectionHistoryPositions[selectionHistoryPositions.length - 1]);
    return true;
  }, [selectionHistoryPositions]);

  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryPointer(-1);
    setSkipCandidateIndex(null);
    safeRemoveItem(historyStorageKey);
  }, [historyStorageKey]);

  const resetAll = useCallback(() => {
    resetHistory();
    clearBlocked();
    setSkippedSet(new Set());
    clearPersisted();
  }, [clearBlocked, clearPersisted, resetHistory]);

  const clearSkippedSession = useCallback(() => {
    setSkipCandidateIndex(null);
    setSkippedSet(new Set());
  }, []);

  const skipCurrent = useCallback((mode: 'session' | 'permanent') => {
    if (typeof currentIndex !== 'number' || !canSkipCurrent) return false;

    const hasRemainingAfterSkip = remainingIndices.some((index) => index !== currentIndex);

    setSkipCandidateIndex(null);

    if (mode === 'permanent') {
      addBlocked(currentIndex);
    } else {
      setSkippedSet((prev) => {
        const copy = new Set(prev);
        copy.add(currentIndex);
        return copy;
      });
    }

    removeUsed(currentIndex);

    setHistory((prevHistory) => {
      const currentPosition = prevHistory.indexOf(currentIndex);
      if (currentPosition === -1) return prevHistory;

      const nextHistory = prevHistory.filter((index, position) => !(index === currentIndex && position === currentPosition));
      const nextPointer = nextHistory.length === 0
        ? -1
        : Math.min(Math.max(currentPosition - 1, 0), nextHistory.length - 1);

      setHistoryPointer(nextPointer);
      persistHistory(nextHistory);
      return nextHistory;
    });

    return { skipped: true, hasRemainingAfterSkip };
  }, [addBlocked, canSkipCurrent, currentIndex, persistHistory, remainingIndices, removeUsed]);

  const usedCountInSelection = useMemo(() => {
    return selectableIndices.filter((index) => usedSet.has(index)).length;
  }, [selectableIndices, usedSet]);

  return {
    questions: questions as Question[],
    currentIndex,
    currentQuestion: currentIndexInSelection && typeof currentIndex === 'number'
      ? (questions[currentIndex] as Question)
      : undefined,
    history,
    historyPointer: normalizedPointer,
    historyPointerInSelection: selectionPointer,
    historyCountInSelection: selectionHistoryPositions.length,
    canSkipCurrent,
    next,
    skipCurrent,
    prev,
    forward,
    jumpToLatestInSelection,
    clearSkippedSession,
    resetHistory,
    clearPersisted,
    resetAll,
    remainingCount: remainingIndices.length,
    filteredTotalCount: selectableIndices.length - skippedCountInSelection - blockedCountInSelection,
    playableQuestionCount: questions.length - blockedCount,
    usedCount: size,
    usedCountInSelection,
  } as const;
}
