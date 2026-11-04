import { AudioLines, Pause, Play, RotateCcw, VolumeX } from 'lucide-react';
import { MODES } from '../constants.js';
import { MODE_THEME } from './ui/modeTheme.js';

export default function TimerControls({ timer, onStart, onPause, onResume, onReset, ambientOn, onToggleAmbient, ambientSupported }) {
  const { status, mode, remainingMs, durationMs } = timer;
  const theme = MODE_THEME[mode];
  const canReset = status !== 'idle' || remainingMs !== durationMs;

  let primary;
  if (status === 'running') {
    primary = { label: 'Pause', icon: Pause, onClick: onPause };
  } else if (status === 'paused') {
    primary = { label: 'Resume', icon: Play, onClick: onResume };
  } else {
    primary = {
      label: mode === 'focus' ? 'Start Focus' : `Start ${MODES[mode].label}`,
      icon: Play,
      onClick: onStart,
    };
  }
  const PrimaryIcon = primary.icon;

  return (
    <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
      <button
        type="button"
        onClick={onReset}
        disabled={!canReset}
        className="round-button"
        aria-label="Reset timer"
        title="Reset (R)"
      >
        <RotateCcw className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={primary.onClick}
        className={`group flex h-14 min-w-[11rem] items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r px-7 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] focus-ring sm:h-16 sm:min-w-[13rem] sm:text-lg ${theme.button}`}
        title="Start / pause (Space)"
      >
        <PrimaryIcon className="h-5 w-5 fill-current" aria-hidden="true" />
        {primary.label}
      </button>

      <button
        type="button"
        onClick={onToggleAmbient}
        disabled={!ambientSupported}
        aria-pressed={ambientOn}
        className={`round-button ${ambientOn ? '!border-violet-300 !bg-violet-100 !text-violet-700 dark:!border-violet-500/40 dark:!bg-violet-500/20 dark:!text-violet-200' : ''}`}
        aria-label={ambientOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
        title={ambientOn ? 'Ambient sound: on' : 'Ambient sound: off'}
      >
        {ambientOn ? <AudioLines className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </div>
  );
}
