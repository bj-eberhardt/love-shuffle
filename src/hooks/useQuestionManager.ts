import { useCallback, useMemo, useState } from 'react';
import questions from '../data/questions.json';
import useLocalStorageSet from './useLocalStorageSet';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';

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

  const currentIndex = history.length > 0 ? history[history.length - 1] : undefined;

  const next = useCallback(() => {
    if (remainingIndices.length === 0) return undefined;
    const nextIndex = getRandomFromArray(remainingIndices);
    setHistory((prev) => {
      const nextHistory = [...prev, nextIndex];
      persistHistory(nextHistory);
      return nextHistory;
    });
    addUsed(nextIndex);
    return nextIndex;
  }, [remainingIndices, addUsed, persistHistory]);

  const prev = useCallback(() => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, -1);
      persistHistory(nextHistory);
      return nextHistory;
    });
  }, [persistHistory]);

  const resetHistory = useCallback(() => {
    setHistory([]);
    safeRemoveItem(historyStorageKey);
  }, [historyStorageKey]);

  const resetAll = useCallback(() => {
    setHistory([]);
    clearPersisted();
  }, [clearPersisted]);

  return {
    questions,
    currentIndex,
    currentQuestion: typeof currentIndex === 'number' ? questions[currentIndex] : undefined,
    history,
    next,
    prev,
    resetHistory,
    clearPersisted,
    resetAll,
    remainingCount: remainingIndices.length,
    usedCount: size,
  } as const;
}
