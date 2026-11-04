import { useCallback, useEffect, useRef, useState } from 'react';

/** Minimal toast state: one message at a time, auto-dismissed. */
export function useToast(duration = 3200) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const dismissToast = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, tone = 'success') => {
      window.clearTimeout(timeoutRef.current);
      setToast({ id: Date.now(), message, tone });
      timeoutRef.current = window.setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return { toast, showToast, dismissToast };
}
