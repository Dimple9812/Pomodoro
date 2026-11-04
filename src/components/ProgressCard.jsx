import { PartyPopper, Target } from 'lucide-react';
import { MODES } from '../constants.js';
import { formatMinutes } from '../utils/time.js';
import Card, { CardHeader } from './ui/Card.jsx';
import { MODE_THEME } from './ui/modeTheme.js';

export default function ProgressCard({ today, timer, longBreakInterval }) {
  const dots = Array.from({ length: longBreakInterval }, (_, i) => i < timer.cycleCount);
  const dateLabel = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader icon={Target} title="Today’s Focus" subtitle={dateLabel} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-violet-50/80 p-4 dark:bg-white/[0.03]">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white">
            {today.pomodoros}
          </p>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {today.pomodoros === 1 ? 'Pomodoro' : 'Pomodoros'}
          </p>
        </div>
        <div className="rounded-2xl bg-fuchsia-50/70 p-4 dark:bg-white/[0.03]">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white">
            {formatMinutes(today.focusMinutes)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">focused</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-200">
            Daily goal: {today.pomodoros} / {today.goal}
          </span>
          <span className="font-semibold text-violet-600 tabular-nums dark:text-violet-300">{today.percent}%</span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-violet-100 dark:bg-white/[0.06]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={today.percent}
          aria-label="Daily goal progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-700 ease-out"
            style={{ width: `${today.percent}%` }}
          />
        </div>
        {today.goalReached ? (
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <PartyPopper className="h-4 w-4" aria-hidden="true" /> Daily goal reached — fantastic work!
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200/70 px-4 py-3 dark:border-white/[0.06]">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Current session</p>
          <p className={`text-sm font-semibold ${MODE_THEME[timer.mode].text}`}>{MODES[timer.mode].longLabel}</p>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`${timer.cycleCount} of ${longBreakInterval} sessions before long break`}>
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                filled ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-zinc-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
