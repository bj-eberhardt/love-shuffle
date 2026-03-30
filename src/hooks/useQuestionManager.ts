import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Question, QuestionCategory } from '../types/questions';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';
import useLocalStorageSet from './useLocalStorageSet';

function getRandomFromArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getStorageKey(datasetKey: string, suffix: string) {
  return `loveShuffle.${suffix}.${datasetKey}.v1`;
}

export default function useQuestionManager(
  questions: Question[],
  selectedCategories: QuestionCategory[],
  datasetKey: string,
) {
  const usedStorageKey = getStorageKey(datasetKey, 'usedQuestions');
  const blockedStorageKey = getStorageKey(datasetKey, 'blockedQuestions');
  const historyStorageKey = getStorageKey(datasetKey, 'history');

  const { set: usedSet, add: addUsed, remove: removeUsed, clear: clearPersisted, size } = useLocalStorageSet<string>(usedStorageKey);
  const { set: blockedSet, add: addBlocked, clear: clearBlocked, size: blockedCount } = useLocalStorageSet<string>(blockedStorageKey);
  const [skippedSet, setSkippedSet] = useState<Set<string>>(() => new Set());
  const [skipCandidateId, setSkipCandidateId] = useState<string | null>(null);

  const validQuestionIds = useMemo(() => new Set(questions.map((question) => question.id)), [questions]);

  const [history, setHistory] = useState<string[]>(() => {
    const raw = safeGetItem<string[]>(historyStorageKey);
    if (!raw || !Array.isArray(raw)) return [];
    return raw.filter((id) => typeof id === 'string');
  });

  const [historyPointer, setHistoryPointer] = useState<number>(() => {
    const raw = safeGetItem<string[]>(historyStorageKey);
    return raw && Array.isArray(raw) && raw.length > 0 ? raw.length - 1 : -1;
  });

  useEffect(() => {
    const raw = safeGetItem<string[]>(historyStorageKey);
    const nextHistory = raw && Array.isArray(raw)
      ? raw.filter((id) => typeof id === 'string' && validQuestionIds.has(id))
      : [];

    setHistory(nextHistory);
    setHistoryPointer(nextHistory.length > 0 ? nextHistory.length - 1 : -1);
    setSkipCandidateId(null);
    setSkippedSet(new Set());
  }, [historyStorageKey, validQuestionIds]);

  const persistHistory = useCallback((nextHistory: string[]) => {
    const filteredHistory = nextHistory.filter((id) => validQuestionIds.has(id));

    if (filteredHistory.length === 0) {
      safeRemoveItem(historyStorageKey);
      return;
    }

    safeSetItem(historyStorageKey, filteredHistory);
  }, [historyStorageKey, validQuestionIds]);

  const questionsById = useMemo(() => {
    return new Map(questions.map((question) => [question.id, question] as const));
  }, [questions]);

  const selectableIds = useMemo(() => {
    return questions
      .filter((question) => selectedCategories.includes(question.category))
      .map((question) => question.id);
  }, [questions, selectedCategories]);

  const selectableIdSet = useMemo(() => new Set(selectableIds), [selectableIds]);

  const remainingIds = useMemo(() => {
    return selectableIds.filter((id) => !usedSet.has(id) && !skippedSet.has(id) && !blockedSet.has(id));
  }, [blockedSet, selectableIds, skippedSet, usedSet]);

  const skippedCountInSelection = useMemo(() => {
    return selectableIds.filter((id) => skippedSet.has(id)).length;
  }, [selectableIds, skippedSet]);

  const blockedCountInSelection = useMemo(() => {
    return selectableIds.filter((id) => blockedSet.has(id)).length;
  }, [blockedSet, selectableIds]);

  const normalizedHistory = useMemo(() => history.filter((id) => validQuestionIds.has(id)), [history, validQuestionIds]);

  const normalizedPointer = normalizedHistory.length === 0
    ? -1
    : Math.min(Math.max(historyPointer, 0), normalizedHistory.length - 1);

  const currentId = normalizedPointer >= 0 ? normalizedHistory[normalizedPointer] : undefined;
  const currentIdInSelection = typeof currentId === 'string' && selectableIdSet.has(currentId);

  const selectionHistoryPositions = useMemo(() => {
    return normalizedHistory.reduce<number[]>((positions, id, position) => {
      if (selectableIdSet.has(id)) positions.push(position);
      return positions;
    }, []);
  }, [normalizedHistory, selectableIdSet]);

  const selectionPointer = currentIdInSelection
    ? selectionHistoryPositions.indexOf(normalizedPointer)
    : -1;

  const canSkipCurrent =
    currentIdInSelection &&
    selectionPointer === selectionHistoryPositions.length - 1 &&
    currentId === skipCandidateId;

  const next = useCallback(() => {
    if (remainingIds.length === 0) return undefined;

    const nextId = getRandomFromArray(remainingIds);
    setHistory((prevHistory) => {
      const nextHistory = [...prevHistory.filter((id) => validQuestionIds.has(id)), nextId];
      setHistoryPointer(nextHistory.length - 1);
      setSkipCandidateId(nextId);
      persistHistory(nextHistory);
      return nextHistory;
    });
    addUsed(nextId);
    return nextId;
  }, [addUsed, persistHistory, remainingIds, validQuestionIds]);

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
      setSkipCandidateId(null);
      setHistoryPointer(-1);
      return false;
    }

    setSkipCandidateId(null);
    setHistoryPointer(selectionHistoryPositions[selectionHistoryPositions.length - 1]);
    return true;
  }, [selectionHistoryPositions]);

  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryPointer(-1);
    setSkipCandidateId(null);
    safeRemoveItem(historyStorageKey);
  }, [historyStorageKey]);

  const resetAll = useCallback(() => {
    resetHistory();
    clearBlocked();
    setSkippedSet(new Set());
    clearPersisted();
  }, [clearBlocked, clearPersisted, resetHistory]);

  const clearSkippedSession = useCallback(() => {
    setSkipCandidateId(null);
    setSkippedSet(new Set());
  }, []);

  const skipCurrent = useCallback((mode: 'session' | 'permanent') => {
    if (typeof currentId !== 'string' || !canSkipCurrent) return false;

    const hasRemainingAfterSkip = remainingIds.some((id) => id !== currentId);

    setSkipCandidateId(null);

    if (mode === 'permanent') {
      addBlocked(currentId);
    } else {
      setSkippedSet((prev) => {
        const copy = new Set(prev);
        copy.add(currentId);
        return copy;
      });
    }

    removeUsed(currentId);

    setHistory((prevHistory) => {
      const filteredHistory = prevHistory.filter((id) => validQuestionIds.has(id));
      const currentPosition = filteredHistory.indexOf(currentId);
      if (currentPosition === -1) return filteredHistory;

      const nextHistory = filteredHistory.filter((id, position) => !(id === currentId && position === currentPosition));
      const nextPointer = nextHistory.length === 0
        ? -1
        : Math.min(Math.max(currentPosition - 1, 0), nextHistory.length - 1);

      setHistoryPointer(nextPointer);
      persistHistory(nextHistory);
      return nextHistory;
    });

    return { skipped: true, hasRemainingAfterSkip };
  }, [addBlocked, canSkipCurrent, currentId, persistHistory, remainingIds, removeUsed, validQuestionIds]);

  const usedCountInSelection = useMemo(() => {
    return selectableIds.filter((id) => usedSet.has(id)).length;
  }, [selectableIds, usedSet]);

  return {
    questions,
    currentId,
    currentQuestion: currentIdInSelection && typeof currentId === 'string'
      ? questionsById.get(currentId)
      : undefined,
    history: normalizedHistory,
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
    remainingCount: remainingIds.length,
    filteredTotalCount: selectableIds.length - skippedCountInSelection - blockedCountInSelection,
    playableQuestionCount: questions.length - blockedCount,
    usedCount: size,
    usedCountInSelection,
  } as const;
}
