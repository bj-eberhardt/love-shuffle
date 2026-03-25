import { useCallback, useState } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

export default function useLocalStorageSet(key: string) {
  const [setState, setSetState] = useState<Set<number>>(() => {
    const raw = safeGetItem<number[]>(key);
    if (raw && Array.isArray(raw)) return new Set(raw);
    return new Set<number>();
  });

  const persist = useCallback((s: Set<number>) => {
    safeSetItem(key, Array.from(s));
  }, [key]);

  const add = useCallback((n: number) => {
    setSetState((prev) => {
      const copy = new Set(prev);
      copy.add(n);
      persist(copy);
      return copy;
    });
  }, [persist]);

  const clear = useCallback(() => {
    setSetState(new Set());
    safeRemoveItem(key);
  }, [key]);

  return {
    set: setState,
    add,
    clear,
    size: setState.size,
  } as const;
}
