import { useCallback } from 'react';
import { MAX_HISTORY_ENTRIES, STORAGE_KEYS } from '../constants.js';
import { useLocalStorage } from './useLocalStorage.js';
import { sanitizeHistory } from '../utils/validation.js';
import { getDateKey, msToMinutes } from '../utils/time.js';

export function useSessionHistory() {
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, [], sanitizeHistory);

  /** Record a completed session from a timer completion event (deduplicated by id). */
  const recordSession = useCallback(
    (event) => {
      const entry = {
        id: event.id,
        mode: event.mode,
        durationMinutes: msToMinutes(event.durationMs),
        completedAt: event.completedAt,
        date: getDateKey(event.completedAt),
      };
      setHistory((previous) =>
        previous.some((item) => item.id === entry.id)
          ? previous
          : [...previous, entry].slice(-MAX_HISTORY_ENTRIES),
      );
    },
    [setHistory],
  );

  const resetToday = useCallback(() => {
    const today = getDateKey();
    setHistory((previous) => previous.filter((entry) => entry.date !== today));
  }, [setHistory]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return { history, recordSession, resetToday, clearHistory };
}
