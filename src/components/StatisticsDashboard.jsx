import { useMemo } from 'react';
import { CalendarDays, Clock3, Flame, History, RotateCcw, Target, Trash2, TrendingUp, Activity } from 'lucide-react';
import Card, { CardHeader } from './ui/Card.jsx';
import BarChart from './ui/BarChart.jsx';
import ProgressRing from './ui/ProgressRing.jsx';
import SessionHistory from './SessionHistory.jsx';
import { getDailySeries, getHourlySeries, getSummary } from '../utils/stats.js';
import { formatMinutes } from '../utils/time.js';

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums sm:text-3xl dark:text-white">
        {value}
      </p>
      {hint ? <p className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500">{hint}</p> : null}
    </Card>
  );
}

const HOUR_LABELS = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };

export default function StatisticsDashboard({ history, today, settings, onResetToday, onClearHistory }) {
  const summary = useMemo(() => getSummary(history), [history]);
  const weekly = useMemo(() => getDailySeries(history, 7), [history]);
  const hourly = useMemo(() => getHourlySeries(history), [history]);
  const hasAnyHistory = history.length > 0;
  const hasToday = today.pomodoros > 0 || history.some((e) => e.date === weekly[weekly.length - 1].key);

  const confirmResetToday = () => {
    if (window.confirm('Reset today’s statistics? Sessions completed today will be removed.')) onResetToday();
  };
  const confirmClear = () => {
    if (window.confirm('Clear your entire session history? This cannot be undone.')) onClearHistory();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Statistics</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your focus habits, stored privately in this browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={confirmResetToday} disabled={!hasToday}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset today
          </button>
          <button type="button" className="btn-danger" onClick={confirmClear} disabled={!hasAnyHistory}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear history
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Total pomodoros"
          value={summary.totalPomodoros}
          hint={summary.streak ? `${summary.streak}-day streak` : 'Start a streak today'}
          accent="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
        />
        <StatCard
          icon={Clock3}
          label="Total focus time"
          value={formatMinutes(summary.totalFocusMinutes)}
          hint={summary.activeDays ? `Across ${summary.activeDays} active day${summary.activeDays === 1 ? '' : 's'}` : 'No focus time yet'}
          accent="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300"
        />
        <StatCard
          icon={Target}
          label="Today"
          value={`${today.pomodoros}/${today.goal}`}
          hint={`${formatMinutes(today.focusMinutes)} focused · ${today.percent}%`}
          accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        />
        <StatCard
          icon={TrendingUp}
          label="Daily average"
          value={formatMinutes(summary.averageDailyMinutes)}
          hint={summary.bestDay ? `Best: ${summary.bestDay.label} · ${formatMinutes(summary.bestDay.minutes)}` : 'Last 7 days'}
          accent="bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader
            icon={CalendarDays}
            title="Weekly focus activity"
            subtitle={`${formatMinutes(summary.weekMinutes)} · ${summary.weekPomodoros} pomodoros in the last 7 days`}
          />
          <BarChart
            ariaLabel="Focus minutes per day for the last 7 days"
            data={weekly.map((d) => ({
              key: d.key,
              label: d.label,
              value: d.minutes,
              highlight: d.isToday,
              tooltip: `${d.fullLabel} · ${formatMinutes(d.minutes)} · ${d.pomodoros} 🍅`,
            }))}
            formatValue={formatMinutes}
            goal={settings.dailyGoal * settings.focusMinutes}
            height={220}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader icon={Activity} title="Today’s progress" subtitle="Daily goal and focus by hour" />
          <div className="flex items-center gap-5">
            <ProgressRing value={today.percent / 100} size={112} stroke={10} id="today-goal-ring">
              <div className="text-center">
                <p className="text-2xl font-semibold text-zinc-900 tabular-nums dark:text-white">{today.percent}%</p>
                <p className="text-[11px] text-zinc-400">of goal</p>
              </div>
            </ProgressRing>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-white">{today.pomodoros}</span> of {today.goal} pomodoros
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-white">{formatMinutes(today.focusMinutes)}</span> focused
              </p>
              <p className="text-xs text-zinc-400">
                {today.goalReached
                  ? 'Goal reached 🎉'
                  : `${today.goal - today.pomodoros} more to reach your goal`}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <BarChart
              compact
              ariaLabel="Focus minutes by hour today"
              height={90}
              data={hourly.map((h) => ({
                key: h.hour,
                label: HOUR_LABELS[h.hour] ?? '',
                value: h.minutes,
                highlight: h.minutes > 0,
                tooltip: `${new Date(2000, 0, 1, h.hour).toLocaleTimeString([], { hour: 'numeric' })} · ${formatMinutes(h.minutes)}`,
              }))}
              formatValue={formatMinutes}
            />
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <CardHeader icon={History} title="Session history" subtitle="Your 30 most recent sessions" />
        <SessionHistory entries={history} limit={30} showDates />
      </Card>
    </div>
  );
}
