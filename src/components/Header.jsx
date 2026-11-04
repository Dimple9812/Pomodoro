import { Settings } from 'lucide-react';
import Logo from './Logo.jsx';
import Navigation from './Navigation.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { MODE_THEME } from './ui/modeTheme.js';
import { formatTime } from '../utils/time.js';

export default function Header({ view, onNavigate, theme, onToggleTheme, timer }) {
  const showMiniTimer = view !== 'timer' && !timer.isIdle;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-950/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('timer')}
          className="flex items-center gap-2.5 rounded-xl focus-ring"
          aria-label="FocusFlow home"
        >
          <Logo className="h-9 w-9 drop-shadow-sm" />
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">FocusFlow</span>
        </button>

        <Navigation view={view} onNavigate={onNavigate} />

        <div className="flex items-center gap-2">
          {showMiniTimer ? (
            <button
              type="button"
              onClick={() => onNavigate('timer')}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold tabular-nums text-zinc-800 shadow-sm animate-fade-in focus-ring dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              aria-label="Return to timer"
            >
              <span
                className={`h-2 w-2 rounded-full ${MODE_THEME[timer.mode].dot} ${timer.isRunning ? 'animate-pulse' : 'opacity-50'}`}
              />
              {formatTime(timer.remainingMs)}
            </button>
          ) : null}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`icon-button ${view === 'settings' ? 'text-violet-600 dark:text-violet-300' : ''}`}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
