import { useCallback, useMemo, useState } from 'react';
import questions from '../data/questions.json';
import type { Question, QuestionCategory } from '../types/questions';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';
import useLocalStorageSet from './useLocalStorageSet';

function getRandomFromArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useQuestionManager(selectedCategories: QuestionCategory[]) {
  const { set: usedSet, add: addUsed, clear: clearPersisted, size } = useLocalStorageSet('loveShuffle.usedQuestions.v1');
  const historyStorageKey = 'loveShuffle.history.v1';

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
    return selectableIndices.filter((index) => !usedSet.has(index));
  }, [selectableIndices, usedSet]);

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

  const next = useCallback(() => {
    if (remainingIndices.length === 0) return undefined;

    const nextIndex = getRandomFromArray(remainingIndices);
    setHistory((prevHistory) => {
      const nextHistory = [...prevHistory, nextIndex];
      setHistoryPointer(nextHistory.length - 1);
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
      setHistoryPointer(-1);
      return false;
    }

    setHistoryPointer(selectionHistoryPositions[selectionHistoryPositions.length - 1]);
    return true;
  }, [selectionHistoryPositions]);

  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryPointer(-1);
    safeRemoveItem(historyStorageKey);
  }, [historyStorageKey]);

  const resetAll = useCallback(() => {
    resetHistory();
    clearPersisted();
  }, [clearPersisted, resetHistory]);

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
    next,
    prev,
    forward,
    jumpToLatestInSelection,
    resetHistory,
    clearPersisted,
    resetAll,
    remainingCount: remainingIndices.length,
    filteredTotalCount: selectableIndices.length,
    usedCount: size,
    usedCountInSelection,
  } as const;
}
