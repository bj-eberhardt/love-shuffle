import { useCallback, useState } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

export default function useLocalStorageSet<T extends string | number>(key: string) {
  const [setState, setSetState] = useState<Set<T>>(() => {
    const raw = safeGetItem<T[]>(key);
    if (raw && Array.isArray(raw)) return new Set(raw);
    return new Set<T>();
  });

  const persist = useCallback((s: Set<T>) => {
    safeSetItem(key, Array.from(s));
  }, [key]);

  const add = useCallback((n: T) => {
    setSetState((prev) => {
      const copy = new Set(prev);
      copy.add(n);
      persist(copy);
      return copy;
    });
  }, [persist]);

  const remove = useCallback((n: T) => {
    setSetState((prev) => {
      if (!prev.has(n)) return prev;

      const copy = new Set(prev);
      copy.delete(n);

      if (copy.size === 0) {
        safeRemoveItem(key);
      } else {
        persist(copy);
      }

      return copy;
    });
  }, [key, persist]);

  const clear = useCallback(() => {
    setSetState(new Set());
    safeRemoveItem(key);
  }, [key]);

  return {
    set: setState,
    add,
    remove,
    clear,
    size: setState.size,
  } as const;
}
