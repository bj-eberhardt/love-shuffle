import { useCallback, useMemo, useState } from 'react';
import questions from '../data/questions.json';
import useLocalStorageSet from './useLocalStorageSet';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';
import type { Question } from '../types/questions';

function getRandomFromArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useQuestionManager() {
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

  const remainingIndices = useMemo(() => {
    const all = questions.map((_, i) => i);
    return all.filter((i) => !usedSet.has(i));
  }, [usedSet]);

  const normalizedPointer = history.length === 0
    ? -1
    : Math.min(Math.max(historyPointer, 0), history.length - 1);

  const currentIndex = normalizedPointer >= 0 ? history[normalizedPointer] : undefined;

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
    setHistoryPointer((prevPointer) => Math.max(prevPointer - 1, 0));
  }, []);

  const forward = useCallback(() => {
    setHistoryPointer((prevPointer) => Math.min(prevPointer + 1, history.length - 1));
  }, [history.length]);

  const jumpToLatest = useCallback(() => {
    setHistoryPointer(history.length > 0 ? history.length - 1 : -1);
  }, [history.length]);

  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryPointer(-1);
    safeRemoveItem(historyStorageKey);
  }, [historyStorageKey]);

  const resetAll = useCallback(() => {
    resetHistory();
    clearPersisted();
  }, [clearPersisted, resetHistory]);

  return {
    questions,
    currentIndex,
    currentQuestion: typeof currentIndex === 'number' ? (questions[currentIndex] as Question) : undefined,
    history,
    historyPointer: normalizedPointer,
    next,
    prev,
    forward,
    jumpToLatest,
    resetHistory,
    clearPersisted,
    resetAll,
    remainingCount: remainingIndices.length,
    usedCount: size,
  } as const;
}
