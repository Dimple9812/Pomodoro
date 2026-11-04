import { useCallback, useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage.js';

const MISSING = Symbol('missing');

/**
 * useState that persists to LocalStorage.
 * - `sanitize` validates whatever was stored (corrupted data never reaches the UI).
 * - Changes made in other tabs are picked up through the `storage` event.
 */
export function useLocalStorage(key, initialValue, sanitize = (value) => value) {
  const sanitizeRef = useRef(sanitize);
  sanitizeRef.current = sanitize;

  const getFallback = useCallback(
    () => (typeof initialValue === 'function' ? initialValue() : initialValue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [value, setValue] = useState(() => {
    const stored = readStorage(key, MISSING);
    if (stored === MISSING) return getFallback();
    try {
      return sanitizeRef.current(stored);
    } catch {
      return getFallback();
    }
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return;
      if (event.newValue === null) {
        setValue(getFallback());
        return;
      }
      try {
        setValue(sanitizeRef.current(JSON.parse(event.newValue)));
      } catch {
        /* ignore corrupted cross-tab writes */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, getFallback]);

  return [value, setValue];
}
