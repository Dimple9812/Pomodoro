import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS } from '../src/constants.js';
import {
  calculateFocusTime,
  calculateProgress,
  formatMinutes,
  formatTime,
  getDateKey,
  getNextSession,
} from '../src/utils/time.js';
import {
  createIdleTimer,
  sanitizeHistory,
  sanitizeSettings,
  sanitizeTimer,
  validateSettingValue,
} from '../src/utils/validation.js';
import { completeTimer, getRemainingMs, isExpired, pauseTimer, startTimer, toggleTimer } from '../src/utils/timerState.js';
import { getDailySeries, getStreak, getTodayStats } from '../src/utils/stats.js';
import { readStorage, writeStorage } from '../src/utils/storage.js';

const MIN = 60_000;
const settings = { ...DEFAULT_SETTINGS };

test('formatTime renders MM:SS and rounds up partial seconds', () => {
  assert.equal(formatTime(25 * MIN), '25:00');
  assert.equal(formatTime(25 * MIN - 200), '25:00');
  assert.equal(formatTime(25 * MIN - 1000), '24:59');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-500), '00:00');
  assert.equal(formatTime(NaN), '00:00');
});

test('calculateProgress is clamped between 0 and 1', () => {
  assert.equal(calculateProgress(25 * MIN, 25 * MIN), 0);
  assert.equal(calculateProgress(0, 25 * MIN), 1);
  assert.equal(calculateProgress(12.5 * MIN, 25 * MIN), 0.5);
  assert.equal(calculateProgress(-10, 100), 1);
  assert.equal(calculateProgress(5, 0), 0);
});

test('getNextSession suggests a long break after the interval', () => {
  assert.equal(getNextSession('focus', 1, 4), 'shortBreak');
  assert.equal(getNextSession('focus', 3, 4), 'shortBreak');
  assert.equal(getNextSession('focus', 4, 4), 'longBreak');
  assert.equal(getNextSession('shortBreak', 2, 4), 'focus');
  assert.equal(getNextSession('longBreak', 0, 4), 'focus');
});

test('calculateFocusTime ignores breaks', () => {
  const entries = [
    { mode: 'focus', durationMinutes: 25 },
    { mode: 'shortBreak', durationMinutes: 5 },
    { mode: 'focus', durationMinutes: 25 },
  ];
  assert.equal(calculateFocusTime(entries), 50);
  assert.equal(formatMinutes(100), '1h 40m');
  assert.equal(formatMinutes(45), '45m');
});

test('timer uses timestamps: start → pause → resume', () => {
  const t0 = 1_000_000;
  let timer = createIdleTimer('focus', settings);
  timer = startTimer(timer, t0);
  assert.equal(timer.status, 'running');
  assert.equal(timer.endTime, t0 + 25 * MIN);
  // 10 minutes later — even if no ticks happened (throttled tab)
  assert.equal(getRemainingMs(timer, t0 + 10 * MIN), 15 * MIN);
  timer = pauseTimer(timer, t0 + 10 * MIN);
  assert.equal(timer.status, 'paused');
  assert.equal(timer.remainingMs, 15 * MIN);
  // time passes while paused: remaining stays the same
  assert.equal(getRemainingMs(timer, t0 + 60 * MIN), 15 * MIN);
  timer = toggleTimer(timer, t0 + 60 * MIN);
  assert.equal(timer.status, 'running');
  assert.equal(timer.endTime, t0 + 75 * MIN);
  // starting twice never creates a second timer
  assert.equal(startTimer(timer, t0 + 61 * MIN), timer);
});

test('completing focus sessions cycles through short and long breaks', () => {
  let timer = createIdleTimer('focus', settings);
  let now = 0;
  const modes = [];
  for (let i = 0; i < 8; i += 1) {
    timer = startTimer(timer, now);
    now = timer.endTime;
    assert.ok(isExpired(timer, now));
    const { nextTimer, event } = completeTimer(timer, settings, now);
    modes.push(`${event.mode}->${event.nextMode}`);
    assert.equal(nextTimer.status, 'idle', 'no auto-start by default');
    timer = nextTimer;
  }
  assert.deepEqual(modes, [
    'focus->shortBreak',
    'shortBreak->focus',
    'focus->shortBreak',
    'shortBreak->focus',
    'focus->shortBreak',
    'shortBreak->focus',
    'focus->longBreak',
    'longBreak->focus',
  ]);
  assert.equal(timer.cycleCount, 0);
});

test('auto-start flags start the next session immediately', () => {
  const auto = { ...settings, autoStartBreaks: true };
  const timer = startTimer(createIdleTimer('focus', auto), 0);
  const { nextTimer, event } = completeTimer(timer, auto, timer.endTime);
  assert.equal(nextTimer.status, 'running');
  assert.equal(nextTimer.endTime, timer.endTime + 5 * MIN);
  assert.equal(event.autoStarted, true);
  assert.equal(event.id, `focus-${timer.endTime}`);
});

test('sanitizeSettings clamps invalid values and keeps defaults', () => {
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings('garbage'), DEFAULT_SETTINGS);
  const s = sanitizeSettings({ focusMinutes: -5, shortBreakMinutes: 'abc', longBreakMinutes: 9999, soundEnabled: 'yes', autoStartFocus: true });
  assert.equal(s.focusMinutes, 1);
  assert.equal(s.shortBreakMinutes, 5);
  assert.equal(s.longBreakMinutes, 90);
  assert.equal(s.soundEnabled, true);
  assert.equal(s.autoStartFocus, true);
});

test('validateSettingValue reports helpful errors', () => {
  assert.equal(validateSettingValue('focusMinutes', '25'), null);
  assert.match(validateSettingValue('focusMinutes', ''), /required/);
  assert.match(validateSettingValue('focusMinutes', '2.5'), /whole number/);
  assert.match(validateSettingValue('focusMinutes', '0'), /between 1 and 180/);
  assert.match(validateSettingValue('dailyGoal', 'abc'), /whole number/);
});

test('sanitizeTimer recovers from corrupted state', () => {
  assert.equal(sanitizeTimer(null, settings).status, 'idle');
  assert.equal(sanitizeTimer({ mode: 'nope' }, settings).mode, 'focus');
  assert.equal(sanitizeTimer({ mode: 'focus', status: 'running', duration: 1500000, endTime: 'x' }, settings).status, 'idle');
  const paused = sanitizeTimer({ mode: 'shortBreak', status: 'paused', duration: 300000, remainingMs: 120000, cycleCount: 2 }, settings);
  assert.equal(paused.status, 'paused');
  assert.equal(paused.remainingMs, 120000);
  assert.equal(paused.cycleCount, 2);
  const running = sanitizeTimer({ mode: 'focus', status: 'running', duration: 1500000, endTime: Date.now() - 1000 }, settings);
  assert.equal(running.status, 'running', 'expired running timers are restored so they can complete');
});

test('sanitizeHistory drops invalid and duplicate entries', () => {
  const now = Date.now();
  const cleaned = sanitizeHistory([
    { id: 'a', mode: 'focus', durationMinutes: 25, completedAt: now },
    { id: 'a', mode: 'focus', durationMinutes: 25, completedAt: now },
    { id: 'b', mode: 'weird', durationMinutes: 25, completedAt: now },
    { id: 'c', mode: 'focus', durationMinutes: -1, completedAt: now },
    'junk',
    null,
  ]);
  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].date, getDateKey(now));
  assert.deepEqual(sanitizeHistory('not an array'), []);
});

test('stats: today, weekly series and streak', () => {
  const now = new Date(2026, 10, 4, 15, 0).getTime();
  const day = 24 * 60 * MIN;
  const entry = (id, offsetDays, mode = 'focus') => {
    const completedAt = now - offsetDays * day;
    return { id, mode, durationMinutes: 25, completedAt, date: getDateKey(completedAt) };
  };
  const history = [entry('1', 0), entry('2', 0), entry('3', 0, 'shortBreak'), entry('4', 1), entry('5', 2), entry('6', 5)];
  const today = getTodayStats(history, 8, now);
  assert.equal(today.pomodoros, 2);
  assert.equal(today.focusMinutes, 50);
  assert.equal(today.percent, 25);
  const week = getDailySeries(history, 7, now);
  assert.equal(week.length, 7);
  assert.equal(week[6].minutes, 50);
  assert.equal(week[6].isToday, true);
  assert.equal(week[1].minutes, 25);
  assert.equal(getStreak(history, now), 3);
});

test('storage never throws without LocalStorage (memory fallback)', () => {
  assert.equal(readStorage('missing', 'fallback'), 'fallback');
  writeStorage('k', { a: 1 });
  assert.deepEqual(readStorage('k'), { a: 1 });
});
