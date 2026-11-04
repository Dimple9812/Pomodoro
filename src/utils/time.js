import { MODES } from '../constants.js';

const MS_PER_MINUTE = 60_000;

/** Format milliseconds as MM:SS (minutes may exceed 99 for very long sessions). */
export function formatTime(ms) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  // Round up so a fresh 25-minute session shows 25:00 rather than 24:59.
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Fraction (0–1) of the session that has elapsed. */
export function calculateProgress(remainingMs, durationMs) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  const remaining = Number.isFinite(remainingMs) ? remainingMs : durationMs;
  const progress = 1 - remaining / durationMs;
  return Math.min(1, Math.max(0, progress));
}

/** Total focus minutes for a list of history entries (break entries are ignored). */
export function calculateFocusTime(entries) {
  if (!Array.isArray(entries)) return 0;
  const total = entries.reduce(
    (sum, entry) => (entry && entry.mode === 'focus' ? sum + (Number(entry.durationMinutes) || 0) : sum),
    0,
  );
  return Math.round(total * 10) / 10;
}

/**
 * Decide which session comes after the one that just finished.
 * @param {string} completedMode  mode that just finished
 * @param {number} cycleCount     focus sessions completed in the current cycle (already incremented)
 * @param {number} longBreakInterval  focus sessions before a long break
 */
export function getNextSession(completedMode, cycleCount, longBreakInterval) {
  if (completedMode !== 'focus') return 'focus';
  const interval = Math.max(1, Number(longBreakInterval) || 4);
  return cycleCount >= interval ? 'longBreak' : 'shortBreak';
}

/** Which break the user should take next given the current cycle. */
export function getSuggestedBreak(cycleCount, longBreakInterval) {
  return cycleCount >= Math.max(1, Number(longBreakInterval) || 4) ? 'longBreak' : 'shortBreak';
}

export function getDurationMs(mode, settings) {
  const key = MODES[mode]?.settingKey ?? MODES.focus.settingKey;
  const minutes = Number(settings?.[key]);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 25) * MS_PER_MINUTE;
}

/** Local-time date key (YYYY-MM-DD) used to group sessions by day. */
export function getDateKey(input = Date.now()) {
  const date = input instanceof Date ? input : new Date(input);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Human friendly minutes: 45 → "45m", 100 → "1h 40m". */
export function formatMinutes(totalMinutes) {
  const minutes = Math.round(Number(totalMinutes) || 0);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function msToMinutes(ms) {
  return Math.round((ms / MS_PER_MINUTE) * 100) / 100;
}
