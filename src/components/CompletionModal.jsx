import { useEffect, useRef } from 'react';
import { Coffee, Sparkles, X, Zap } from 'lucide-react';
import { MODES, MOTIVATIONAL_MESSAGES } from '../constants.js';
import { MODE_THEME } from './ui/modeTheme.js';

/** In-app celebration shown when any session completes. */
export default function CompletionModal({ event, today, longBreakInterval, onStartNext, onClose }) {
  const primaryRef = useRef(null);

  useEffect(() => {
    if (!event) return undefined;
    primaryRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, onClose]);

  if (!event) return null;

  const wasFocus = event.mode === 'focus';
  const next = MODES[event.nextMode];
  const nextTheme = MODE_THEME[event.nextMode];
  const messages = MOTIVATIONAL_MESSAGES[wasFocus ? event.nextMode : 'focus'];
  const message = messages[(today.pomodoros + event.cycleCount) % messages.length];

  let title;
  let subtitle;
  if (wasFocus) {
    title = 'Focus session complete!';
    subtitle =
      event.nextMode === 'longBreak'
        ? `You’ve finished ${longBreakInterval} focus sessions — time for a well-earned long break.`
        : 'Nice work. Take a short break before the next round.';
  } else {
    title = event.mode === 'longBreak' ? 'Long break is over' : 'Break is over';
    subtitle = 'Recharged and ready? Let’s get back into flow.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white p-6 text-center shadow-2xl animate-scale-in sm:p-8 dark:border-white/10 dark:bg-ink-850"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/30 blur-3xl"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-ring dark:hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/25 [animation-iteration-count:2]" />
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="white"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                className="animate-draw-check"
              />
            </svg>
          </span>
        </div>

        <h2 id="completion-title" className="relative text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="relative mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{subtitle}</p>

        <div className="relative mt-5 flex items-center justify-center gap-2 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </div>

        <p className="relative mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          {today.pomodoros} of {today.goal} pomodoros completed today
        </p>

        <div className="relative mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {event.autoStarted ? (
            <button ref={primaryRef} type="button" onClick={onClose} className="btn-primary h-11 justify-center px-6">
              Got it — {next.label} started
            </button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="btn-secondary h-11 justify-center px-5">
                Not now
              </button>
              <button
                ref={primaryRef}
                type="button"
                onClick={onStartNext}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 focus-ring ${nextTheme.button}`}
              >
                {event.nextMode === 'focus' ? <Zap className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                Start {next.label}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
