import { MODES } from '../constants.js';
import { formatTime } from '../utils/time.js';
import { MODE_THEME } from './ui/modeTheme.js';

const SIZE = 320;
const STROKE = 14;
const RADIUS = SIZE / 2 - STROKE - 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICKS = Array.from({ length: 60 }, (_, i) => i);

const STATUS_LABEL = { idle: 'Ready', running: 'In progress', paused: 'Paused' };

export default function PomodoroTimer({ timer, longBreakInterval }) {
  const { mode, status, remainingMs, progress, cycleCount } = timer;
  const theme = MODE_THEME[mode];
  const gradientId = `ff-ring-${mode}`;
  const cyclePosition = Math.min(cycleCount + 1, longBreakInterval);

  return (
    <div className="relative mx-auto my-6 aspect-square w-full max-w-[min(80vw,340px)] sm:my-8">
      {/* soft glow */}
      <div
        aria-hidden="true"
        className={`absolute inset-[10%] rounded-full bg-gradient-to-br blur-3xl transition-all duration-700 ${theme.glow} ${
          status === 'running' ? 'animate-soft-pulse' : 'opacity-60'
        }`}
      />
      <div
        aria-hidden="true"
        className="absolute inset-[7%] rounded-full bg-white/80 shadow-[inset_0_2px_12px_rgba(76,29,149,0.06)] dark:bg-ink-900/70 dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]"
      />

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.gradient[0]} />
            <stop offset="100%" stopColor={theme.gradient[1]} />
          </linearGradient>
        </defs>

        {TICKS.map((i) => {
          const angle = (i / 60) * 2 * Math.PI;
          const major = i % 5 === 0;
          const outer = SIZE / 2 - 2;
          const inner = outer - (major ? 7 : 4);
          return (
            <line
              key={i}
              x1={SIZE / 2 + outer * Math.cos(angle)}
              y1={SIZE / 2 + outer * Math.sin(angle)}
              x2={SIZE / 2 + inner * Math.cos(angle)}
              y2={SIZE / 2 + inner * Math.sin(angle)}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
              className={i / 60 < progress ? 'stroke-violet-400/70' : 'stroke-zinc-300/70 dark:stroke-white/10'}
            />
          );
        })}

        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-violet-100/90 dark:stroke-white/[0.06]"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          style={{
            transition: 'stroke-dashoffset 0.3s linear, opacity 0.3s',
            opacity: progress > 0.001 ? 1 : 0,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${theme.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} ${status === 'running' ? 'animate-pulse' : ''}`} />
          {STATUS_LABEL[status]}
        </span>
        <time
          role="timer"
          aria-live="off"
          aria-label={`${formatTime(remainingMs)} remaining`}
          className="text-[clamp(3rem,15vw,4.75rem)] font-semibold leading-none tracking-tight text-zinc-900 tabular-nums dark:text-white"
        >
          {formatTime(remainingMs)}
        </time>
        <span className={`mt-3 text-sm font-medium ${theme.text}`}>{MODES[mode].longLabel}</span>
        {mode === 'focus' ? (
          <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Session {cyclePosition} of {longBreakInterval}
          </span>
        ) : null}
      </div>
    </div>
  );
}
