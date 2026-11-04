import { calculateFocusTime, getDateKey } from './time.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const focusOnly = (history) => history.filter((entry) => entry.mode === 'focus');

function shiftDays(date, days) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // noon avoids DST edge cases
  d.setDate(d.getDate() + days);
  return d;
}

export function getTodayStats(history, dailyGoal, now = Date.now()) {
  const today = getDateKey(now);
  const todays = focusOnly(history).filter((entry) => entry.date === today);
  const pomodoros = todays.length;
  const goal = Math.max(1, dailyGoal || 1);
  return {
    pomodoros,
    focusMinutes: calculateFocusTime(todays),
    goal,
    percent: Math.min(100, Math.round((pomodoros / goal) * 100)),
    goalReached: pomodoros >= goal,
  };
}

/** Focus minutes and pomodoros for each of the last `days` days (oldest first). */
export function getDailySeries(history, days = 7, now = Date.now()) {
  const focus = focusOnly(history);
  const byDate = new Map();
  for (const entry of focus) {
    const bucket = byDate.get(entry.date) ?? { minutes: 0, pomodoros: 0 };
    bucket.minutes += entry.durationMinutes;
    bucket.pomodoros += 1;
    byDate.set(entry.date, bucket);
  }
  const todayKey = getDateKey(now);
  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = shiftDays(now, -i);
    const key = getDateKey(date);
    const bucket = byDate.get(key) ?? { minutes: 0, pomodoros: 0 };
    series.push({
      key,
      label: date.toLocaleDateString([], { weekday: 'short' }),
      fullLabel: date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }),
      minutes: Math.round(bucket.minutes),
      pomodoros: bucket.pomodoros,
      isToday: key === todayKey,
    });
  }
  return series;
}

/** Focus minutes per hour of the given day. */
export function getHourlySeries(history, now = Date.now()) {
  const key = getDateKey(now);
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0 }));
  for (const entry of focusOnly(history)) {
    if (entry.date !== key) continue;
    hours[new Date(entry.completedAt).getHours()].minutes += entry.durationMinutes;
  }
  return hours.map((h) => ({ ...h, minutes: Math.round(h.minutes) }));
}

export function getStreak(history, now = Date.now()) {
  const days = new Set(focusOnly(history).map((entry) => entry.date));
  let cursor = shiftDays(now, 0);
  // A streak is still alive if today has no session yet but yesterday did.
  if (!days.has(getDateKey(cursor))) cursor = shiftDays(cursor, -1);
  let streak = 0;
  while (days.has(getDateKey(cursor))) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export function getSummary(history, now = Date.now()) {
  const focus = focusOnly(history);
  const week = getDailySeries(history, 7, now);
  const weekMinutes = week.reduce((sum, d) => sum + d.minutes, 0);
  const best = week.reduce((top, d) => (d.minutes > (top?.minutes ?? 0) ? d : top), null);
  const activeDays = new Set(focus.map((entry) => entry.date)).size;
  return {
    totalPomodoros: focus.length,
    totalFocusMinutes: calculateFocusTime(focus),
    weekMinutes,
    weekPomodoros: week.reduce((sum, d) => sum + d.pomodoros, 0),
    averageDailyMinutes: Math.round(weekMinutes / 7),
    bestDay: best,
    activeDays,
    streak: getStreak(history, now),
    firstSessionAt: focus.length ? focus[0].completedAt : null,
    spanDays: focus.length ? Math.max(1, Math.ceil((now - focus[0].completedAt) / DAY_MS)) : 0,
  };
}
