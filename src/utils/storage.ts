export function safeGetItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('storage: read error', key, e);
    return null;
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage: write error', key, e);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('storage: remove error', key, e);
  }
}

export function safeGetSessionItem<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('sessionStorage: read error', key, e);
    return null;
  }
}

export function safeSetSessionItem<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('sessionStorage: write error', key, e);
  }
}

export function safeRemoveSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn('sessionStorage: remove error', key, e);
  }
}
