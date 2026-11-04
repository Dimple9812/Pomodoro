import { BarChart3, Settings2, Timer } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

/** Pill navigation shown in the header on tablet/desktop. */
export default function Navigation({ view, onNavigate }) {
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1 rounded-2xl border border-zinc-200/70 bg-white/60 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all focus-ring ${
                  active
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-white/10 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Bottom tab bar on mobile so every section is one thumb-tap away. */
export function MobileNavigation({ view, onNavigate }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/70 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:border-white/[0.06] dark:bg-ink-950/85"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-ring ${
                  active ? 'text-violet-600 dark:text-violet-300' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${
                    active ? 'bg-violet-100 dark:bg-violet-500/15' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
