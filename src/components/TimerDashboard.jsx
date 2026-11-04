import { History, Keyboard, Sparkles } from 'lucide-react';
import { MOTIVATIONAL_MESSAGES } from '../constants.js';
import Card, { CardHeader } from './ui/Card.jsx';
import SessionTabs from './SessionTabs.jsx';
import PomodoroTimer from './PomodoroTimer.jsx';
import TimerControls from './TimerControls.jsx';
import ProgressCard from './ProgressCard.jsx';
import NotificationManager from './NotificationManager.jsx';
import SessionHistory from './SessionHistory.jsx';
import { getDateKey } from '../utils/time.js';

const SHORTCUTS = [
  ['Space', 'Start / pause'],
  ['R', 'Reset'],
  ['F', 'Focus'],
  ['B', 'Break'],
];

export default function TimerDashboard({
  timer,
  settings,
  today,
  history,
  notifications,
  ambient,
  onStart,
  onEnableNotifications,
  onDisableNotifications,
  onTestNotification,
  onViewStats,
}) {
  const messages = MOTIVATIONAL_MESSAGES[timer.mode];
  const message = messages[(today.pomodoros + timer.cycleCount) % messages.length];
  const todayKey = getDateKey();
  const todaysSessions = history.filter((entry) => entry.date === todayKey);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
      <Card className="flex flex-col items-center px-4 py-6 sm:px-8 sm:py-8">
        <SessionTabs mode={timer.mode} onChange={timer.switchMode} />

        <PomodoroTimer timer={timer} longBreakInterval={settings.longBreakInterval} />

        <TimerControls
          timer={timer}
          onStart={onStart}
          onPause={timer.pause}
          onResume={onStart}
          onReset={timer.reset}
          ambientOn={ambient.on}
          ambientSupported={ambient.supported}
          onToggleAmbient={ambient.toggle}
        />

        <p
          key={message}
          className="mt-7 flex max-w-sm items-center justify-center gap-2 text-center text-sm text-zinc-500 animate-fade-in dark:text-zinc-400"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
          {message}
        </p>

        <div className="mt-6 hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-5 text-xs text-zinc-400 sm:flex dark:border-white/[0.05] dark:text-zinc-500">
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          {SHORTCUTS.map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <kbd className="kbd">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <ProgressCard today={today} timer={timer} longBreakInterval={settings.longBreakInterval} />

        <NotificationManager
          permission={notifications.permission}
          enabled={settings.notificationsEnabled}
          onEnable={onEnableNotifications}
          onDisable={onDisableNotifications}
          onTest={onTestNotification}
        />

        <Card className="p-5 sm:p-6">
          <CardHeader
            icon={History}
            title="Today’s sessions"
            subtitle={`${todaysSessions.length} completed`}
            action={
              history.length ? (
                <button type="button" onClick={onViewStats} className="btn-ghost text-xs">
                  View all
                </button>
              ) : null
            }
          />
          <SessionHistory entries={todaysSessions} limit={5} emptyMessage="Nothing yet today — your first session is one click away." />
        </Card>
      </div>
    </div>
  );
}
