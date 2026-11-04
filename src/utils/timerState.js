/**
 * Pure state transitions for the Pomodoro timer.
 *
 * The timer never relies on counting ticks. A running session stores the
 * absolute `endTime` (epoch ms); remaining time is always `endTime - now`.
 * This keeps the timer accurate when the browser throttles background tabs,
 * the device sleeps, or the page is reloaded.
 */
import { TIMER_STATUS } from '../constants.js';
import { createIdleTimer } from './validation.js';
import { getDurationMs, getNextSession } from './time.js';

export function getRemainingMs(timer, now) {
  if (timer.status === TIMER_STATUS.running) {
    return Math.min(timer.duration, Math.max(0, timer.endTime - now));
  }
  return timer.remainingMs;
}

export function startTimer(timer, now) {
  if (timer.status === TIMER_STATUS.running) return timer;
  const remaining = timer.remainingMs > 0 ? timer.remainingMs : timer.duration;
  return { ...timer, status: TIMER_STATUS.running, remainingMs: remaining, endTime: now + remaining };
}

export function pauseTimer(timer, now) {
  if (timer.status !== TIMER_STATUS.running) return timer;
  const remaining = timer.endTime - now;
  // If the session has already expired, let the completion handler deal with it.
  if (remaining <= 0) return timer;
  return { ...timer, status: TIMER_STATUS.paused, remainingMs: remaining, endTime: null };
}

export function toggleTimer(timer, now) {
  return timer.status === TIMER_STATUS.running ? pauseTimer(timer, now) : startTimer(timer, now);
}

export function resetTimer(timer, settings) {
  return createIdleTimer(timer.mode, settings, timer.cycleCount);
}

export function switchTimerMode(timer, mode, settings) {
  return createIdleTimer(mode, settings, timer.cycleCount);
}

export function isExpired(timer, now) {
  return timer.status === TIMER_STATUS.running && timer.endTime <= now;
}

/**
 * Finish the current session and prepare the next one.
 * Returns the next timer state plus a completion event describing what happened.
 */
export function completeTimer(timer, settings, now) {
  const completedMode = timer.mode;
  let cycleCount = timer.cycleCount;
  if (completedMode === 'focus') cycleCount += 1;
  if (completedMode === 'longBreak') cycleCount = 0;

  const nextMode = getNextSession(completedMode, cycleCount, settings.longBreakInterval);
  const autoStart = nextMode === 'focus' ? settings.autoStartFocus : settings.autoStartBreaks;
  const nextDuration = getDurationMs(nextMode, settings);

  const nextTimer = {
    mode: nextMode,
    status: autoStart ? TIMER_STATUS.running : TIMER_STATUS.idle,
    duration: nextDuration,
    remainingMs: nextDuration,
    endTime: autoStart ? now + nextDuration : null,
    cycleCount,
  };

  const event = {
    id: `${completedMode}-${timer.endTime}`,
    mode: completedMode,
    durationMs: timer.duration,
    completedAt: timer.endTime,
    nextMode,
    autoStarted: autoStart,
    cycleCount,
  };

  return { nextTimer, event };
}
