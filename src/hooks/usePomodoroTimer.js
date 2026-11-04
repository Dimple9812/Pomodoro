import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS, TICK_MS, TIMER_STATUS } from '../constants.js';
import { useLocalStorage } from './useLocalStorage.js';
import { createIdleTimer, sanitizeTimer } from '../utils/validation.js';
import { readStorage, writeStorage } from '../utils/storage.js';
import { calculateProgress, getDurationMs, getSuggestedBreak } from '../utils/time.js';
import {
  completeTimer,
  getRemainingMs,
  isExpired,
  pauseTimer,
  resetTimer,
  startTimer,
  switchTimerMode,
  toggleTimer,
} from '../utils/timerState.js';

/**
 * All Pomodoro business logic lives here; components only render.
 *
 * - Timestamp based: remaining = endTime - now (accurate in throttled tabs).
 * - Exactly one interval exists, and only while a session is running.
 * - Persisted to LocalStorage, so a refresh restores the session — including
 *   one that finished while the page was closed.
 * - Each completion has a stable id (`mode-endTime`) so it is handled once,
 *   even across React StrictMode re-runs or multiple open tabs.
 */
export function usePomodoroTimer({ settings, onComplete }) {
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const sanitize = useCallback((raw) => sanitizeTimer(raw, settingsRef.current), []);
  const [timer, setTimer] = useLocalStorage(
    STORAGE_KEYS.timer,
    () => createIdleTimer('focus', settingsRef.current),
    sanitize,
  );
  const [now, setNow] = useState(() => Date.now());
  const handledCompletionRef = useRef(null);

  const isRunning = timer.status === TIMER_STATUS.running;

  // The single ticking interval. Recreated only when a session starts/stops.
  useEffect(() => {
    if (!isRunning) return undefined;
    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [isRunning, timer.endTime]);

  // Re-sync immediately when the tab becomes visible again.
  useEffect(() => {
    const sync = () => setNow(Date.now());
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Session completion.
  useEffect(() => {
    if (!isExpired(timer, now)) return;
    const { nextTimer, event } = completeTimer(timer, settingsRef.current, Date.now());

    // Always advance the state so the UI never gets stuck at 00:00.
    setTimer(nextTimer);

    if (handledCompletionRef.current === event.id) return;
    handledCompletionRef.current = event.id;

    // Another tab (or an earlier run of this one) may already have handled it.
    if (readStorage(STORAGE_KEYS.lastCompletion, null) === event.id) return;
    writeStorage(STORAGE_KEYS.lastCompletion, event.id);

    onCompleteRef.current?.(event);
  }, [timer, now, setTimer]);

  // When durations change in settings, update an idle timer to match.
  const { focusMinutes, shortBreakMinutes, longBreakMinutes } = settings;
  useEffect(() => {
    setTimer((current) => {
      if (current.status !== TIMER_STATUS.idle) return current;
      const duration = getDurationMs(current.mode, settingsRef.current);
      if (duration === current.duration && current.remainingMs === duration) return current;
      return { ...current, duration, remainingMs: duration };
    });
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, setTimer]);

  const start = useCallback(() => {
    setNow(Date.now());
    setTimer((current) => startTimer(current, Date.now()));
  }, [setTimer]);

  const pause = useCallback(() => {
    setTimer((current) => pauseTimer(current, Date.now()));
  }, [setTimer]);

  const toggle = useCallback(() => {
    setNow(Date.now());
    setTimer((current) => toggleTimer(current, Date.now()));
  }, [setTimer]);

  const reset = useCallback(() => {
    setTimer((current) => resetTimer(current, settingsRef.current));
  }, [setTimer]);

  const switchMode = useCallback(
    (mode) => setTimer((current) => switchTimerMode(current, mode, settingsRef.current)),
    [setTimer],
  );

  const switchToBreak = useCallback(() => {
    setTimer((current) =>
      switchTimerMode(
        current,
        getSuggestedBreak(current.cycleCount, settingsRef.current.longBreakInterval),
        settingsRef.current,
      ),
    );
  }, [setTimer]);

  const remainingMs = getRemainingMs(timer, now);

  return {
    mode: timer.mode,
    status: timer.status,
    remainingMs,
    durationMs: timer.duration,
    progress: calculateProgress(remainingMs, timer.duration),
    cycleCount: timer.cycleCount,
    isRunning,
    isPaused: timer.status === TIMER_STATUS.paused,
    isIdle: timer.status === TIMER_STATUS.idle,
    suggestedBreak: getSuggestedBreak(timer.cycleCount, settings.longBreakInterval),
    start,
    pause,
    resume: start,
    toggle,
    reset,
    switchMode,
    switchToBreak,
  };
}
