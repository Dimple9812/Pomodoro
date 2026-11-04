/**
 * Lightweight, dependency-free bar chart built with flexbox.
 * data: [{ key, label, value, highlight?, tooltip? }]
 */
export default function BarChart({ data, height = 190, formatValue = (v) => v, goal, compact = false, ariaLabel }) {
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value), 1);
  const gap = compact ? 'gap-[3px] sm:gap-1' : 'gap-2 sm:gap-4';

  return (
    <figure aria-label={ariaLabel} className="w-full">
      <div className={`relative flex items-end ${gap}`} style={{ height }}>
        {goal ? (
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-fuchsia-400/70"
            style={{ bottom: `${(goal / max) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 rounded bg-fuchsia-50 px-1.5 text-[10px] font-medium text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
              Goal {formatValue(goal)}
            </span>
          </div>
        ) : null}

        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.key} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className={`absolute inset-x-0 bottom-0 mx-auto h-full rounded-lg bg-violet-50 dark:bg-white/[0.03] ${
                  compact ? 'max-w-[14px]' : 'max-w-[44px]'
                }`}
              />
              <div
                className={`relative w-full rounded-lg transition-[height] duration-700 ease-out ${
                  compact ? 'max-w-[14px] rounded-md' : 'max-w-[44px]'
                } ${
                  d.highlight
                    ? 'bg-gradient-to-t from-violet-600 to-fuchsia-400'
                    : 'bg-gradient-to-t from-violet-300 to-violet-200 dark:from-violet-500/50 dark:to-violet-400/40'
                }`}
                style={{ height: d.value > 0 ? `max(${pct}%, 4px)` : '0px' }}
              >
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-white dark:text-zinc-900"
                >
                  {d.tooltip ?? formatValue(d.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`mt-2 flex ${gap}`}>
        {data.map((d) => (
          <div
            key={d.key}
            className={`flex-1 text-center text-[11px] ${
              d.highlight ? 'font-semibold text-violet-600 dark:text-violet-300' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {d.label}
          </div>
        ))}
      </div>
    </figure>
  );
}
