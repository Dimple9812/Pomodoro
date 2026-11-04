import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

const TONES = {
  success: { icon: CheckCircle2, className: 'text-emerald-500' },
  info: { icon: Info, className: 'text-violet-500' },
  warning: { icon: AlertTriangle, className: 'text-amber-500' },
};

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const { icon: Icon, className } = TONES[toast.tone] ?? TONES.info;
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm animate-toast-in items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/95 px-4 py-3 text-sm text-zinc-800 shadow-xl backdrop-blur md:bottom-8 dark:border-white/10 dark:bg-ink-800/95 dark:text-zinc-100"
    >
      <Icon className={`h-5 w-5 shrink-0 ${className}`} aria-hidden="true" />
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-ring dark:hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
