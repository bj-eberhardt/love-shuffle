import { useCallback, useMemo, useState } from 'react';
import questions from '../data/questions.json';
import useLocalStorageSet from './useLocalStorageSet';

function getRandomFromArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useQuestionManager() {
  const { set: usedSet, add: addUsed, clear: clearPersisted, size } = useLocalStorageSet('loveShuffle.usedQuestions.v1');

  const [history, setHistory] = useState<number[]>([]);

  const remainingIndices = useMemo(() => {
    const all = questions.map((_, i) => i);
    return all.filter((i) => !usedSet.has(i));
  }, [usedSet]);

  const currentIndex = history.length > 0 ? history[history.length - 1] : undefined;

  const next = useCallback(() => {
    if (remainingIndices.length === 0) return undefined;
    const nextIndex = getRandomFromArray(remainingIndices);
    setHistory((prev) => [...prev, nextIndex]);
    addUsed(nextIndex);
    return nextIndex;
  }, [remainingIndices, addUsed]);

  const prev = useCallback(() => {
    setHistory((prev) => prev.slice(0, -1));
  }, []);

  const resetHistory = useCallback(() => {
    setHistory([]);
  }, []);

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
