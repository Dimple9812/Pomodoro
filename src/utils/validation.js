/**
 * Sanitisers for everything read back from LocalStorage. Each one accepts
 * arbitrary (possibly corrupted) input and always returns a valid structure.
 */
import {
  BOOLEAN_SETTINGS,
  DEFAULT_SETTINGS,
  MAX_HISTORY_ENTRIES,
  MODES,
  SETTING_LIMITS,
  TIMER_STATUS,
} from '../constants.js';
import { getDateKey, getDurationMs } from './time.js';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Validate a raw form value for a numeric setting. Returns an error message or null. */
export function validateSettingValue(key, rawValue) {
  const limits = SETTING_LIMITS[key];
  if (!limits) return null;
  const text = String(rawValue ?? '').trim();
  if (text === '') return 'This field is required.';
  const n = Number(text);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return 'Enter a whole number.';
  if (n < limits.min || n > limits.max) return `Must be between ${limits.min} and ${limits.max}.`;
  return null;
}

export function sanitizeSettings(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const settings = { ...DEFAULT_SETTINGS };
  for (const [key, { min, max }] of Object.entries(SETTING_LIMITS)) {
    settings[key] = clampInt(source[key], min, max, DEFAULT_SETTINGS[key]);
  }
  for (const key of BOOLEAN_SETTINGS) {
    if (typeof source[key] === 'boolean') settings[key] = source[key];
  }
  return settings;
}

export function createIdleTimer(mode, settings, cycleCount = 0) {
  const safeMode = MODES[mode] ? mode : 'focus';
  const duration = getDurationMs(safeMode, settings);
  return {
    mode: safeMode,
    status: TIMER_STATUS.idle,
    duration,
    remainingMs: duration,
    endTime: null,
    cycleCount: clampInt(cycleCount, 0, 99, 0),
  };
}

export function sanitizeTimer(raw, settings) {
  if (!isPlainObject(raw) || !MODES[raw.mode]) return createIdleTimer('focus', settings);

  const cycleCount = clampInt(raw.cycleCount, 0, 99, 0);
  const status = Object.values(TIMER_STATUS).includes(raw.status) ? raw.status : TIMER_STATUS.idle;
  const duration = Number(raw.duration);
  const maxDuration = 24 * 60 * 60 * 1000;

  if (!Number.isFinite(duration) || duration <= 0 || duration > maxDuration || status === TIMER_STATUS.idle) {
    return createIdleTimer(raw.mode, settings, cycleCount);
  }

  if (status === TIMER_STATUS.running) {
    const endTime = Number(raw.endTime);
    // A running timer must have an end time that is not absurdly far in the future.
    if (!Number.isFinite(endTime) || endTime - Date.now() > duration + 5_000) {
      return createIdleTimer(raw.mode, settings, cycleCount);
    }
    return { mode: raw.mode, status, duration, remainingMs: duration, endTime, cycleCount };
  }

  // paused
  const remainingMs = Number(raw.remainingMs);
  if (!Number.isFinite(remainingMs) || remainingMs <= 0 || remainingMs > duration) {
    return createIdleTimer(raw.mode, settings, cycleCount);
  }
  return { mode: raw.mode, status, duration, remainingMs, endTime: null, cycleCount };
}

export function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const entries = [];
  for (const item of raw) {
    if (!isPlainObject(item)) continue;
    const { id, mode } = item;
    const durationMinutes = Number(item.durationMinutes);
    const completedAt = Number(item.completedAt);
    if (typeof id !== 'string' || !id || seen.has(id)) continue;
    if (!MODES[mode]) continue;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 24 * 60) continue;
    if (!Number.isFinite(completedAt) || completedAt <= 0) continue;
    seen.add(id);
    entries.push({ id, mode, durationMinutes, completedAt, date: getDateKey(completedAt) });
  }
  entries.sort((a, b) => a.completedAt - b.completedAt);
  return entries.slice(-MAX_HISTORY_ENTRIES);
}
