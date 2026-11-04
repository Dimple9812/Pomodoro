import { useEffect } from 'react';
import { MODES } from '../constants.js';
import { formatTime } from '../utils/time.js';

const DEFAULT_TITLE = 'FocusFlow — Pomodoro Timer';

/** Show the live countdown in the browser tab while a session is active. */
export function useDocumentTitle({ status, remainingMs, mode }) {
  const title =
    status === 'idle'
      ? DEFAULT_TITLE
      : `${status === 'paused' ? '⏸ ' : ''}${formatTime(remainingMs)} · ${MODES[mode].label} | FocusFlow`;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(
    () => () => {
      document.title = DEFAULT_TITLE;
    },
    [],
  );
}
