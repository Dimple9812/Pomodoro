import { Brain, Coffee, History, Sofa } from 'lucide-react';
import { MODES } from '../constants.js';
import { formatClock, formatMinutes, getDateKey } from '../utils/time.js';
import { MODE_THEME } from './ui/modeTheme.js';

const ICONS = { focus: Brain, shortBreak: Coffee, longBreak: Sofa };

function dayLabel(dateKey) {
  const today = getDateKey();
  const yesterday = getDateKey(Date.now() - 24 * 60 * 60 * 1000);
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Most recent sessions first, optionally grouped by day. */
export default function SessionHistory({ entries, limit = 8, showDates = false, emptyMessage }) {
  const items = [...entries].reverse().slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-white/10">
        <History className="mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage ?? 'No sessions yet. Start a focus session to begin.'}
        </p>
      </div>
    );
  }

  let lastDate = null;
  return (
    <ol className="space-y-1.5">
      {items.map((entry) => {
        const Icon = ICONS[entry.mode];
        const showHeading = showDates && entry.date !== lastDate;
        lastDate = entry.date;
        return (
          <li key={entry.id}>
            {showHeading ? (
              <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 first:mt-0 dark:text-zinc-500">
                {dayLabel(entry.date)}
              </p>
            ) : null}
            <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${MODE_THEME[entry.mode].chip}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{MODES[entry.mode].longLabel}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Completed at {formatClock(entry.completedAt)}</p>
              </div>
              <span className="text-sm font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
                {formatMinutes(entry.durationMinutes)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
