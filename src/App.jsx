import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import { MobileNavigation } from './components/Navigation.jsx';
import TimerDashboard from './components/TimerDashboard.jsx';
import StatisticsDashboard from './components/StatisticsDashboard.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import CompletionModal from './components/CompletionModal.jsx';
import Toast from './components/ui/Toast.jsx';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTheme } from './hooks/useTheme.js';
import { useNotifications } from './hooks/useNotifications.js';
import { usePomodoroTimer } from './hooks/usePomodoroTimer.js';
import { useSessionHistory } from './hooks/useSessionHistory.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useDocumentTitle } from './hooks/useDocumentTitle.js';
import { useToast } from './hooks/useToast.js';
import { sanitizeSettings } from './utils/validation.js';
import { getTodayStats } from './utils/stats.js';
import { getCompletionNotification } from './utils/notifications.js';
import {
  isAudioSupported,
  playCompletionSound,
  startAmbientSound,
  stopAmbientSound,
  unlockAudio,
} from './utils/sound.js';

export default function App() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS, sanitizeSettings);
  const [view, setView] = useState('timer');
  const [completion, setCompletion] = useState(null);
  const [ambientOn, setAmbientOn] = useState(false);

  const { history, recordSession, resetToday, clearHistory } = useSessionHistory();
  const notifications = useNotifications();
  const { toast, showToast, dismissToast } = useToast();

  const handleComplete = useCallback(
    (event) => {
      recordSession(event);
      if (settings.soundEnabled) playCompletionSound();
      if (settings.notificationsEnabled) {
        const { title, body } = getCompletionNotification(event.mode, event.nextMode);
        notifications.notify(title, { body, tag: `focusflow-${event.id}` });
      }
      setCompletion(event);
    },
    [recordSession, settings.soundEnabled, settings.notificationsEnabled, notifications],
  );

  const timer = usePomodoroTimer({ settings, onComplete: handleComplete });
  const today = useMemo(() => getTodayStats(history, settings.dailyGoal), [history, settings.dailyGoal]);

  useDocumentTitle(timer);

  // Starting is always a user gesture, so it's the right moment to unlock Web Audio.
  const startTimer = useCallback(() => {
    unlockAudio();
    timer.start();
  }, [timer]);

  const toggleTimer = useCallback(() => {
    unlockAudio();
    timer.toggle();
  }, [timer]);

  useKeyboardShortcuts(
    {
      onToggle: toggleTimer,
      onReset: timer.reset,
      onFocus: () => timer.switchMode('focus'),
      onBreak: timer.switchToBreak,
    },
    view === 'timer' && !completion,
  );

  const toggleAmbient = useCallback(() => {
    if (ambientOn) {
      stopAmbientSound();
      setAmbientOn(false);
    } else if (startAmbientSound()) {
      setAmbientOn(true);
    }
  }, [ambientOn]);

  useEffect(() => () => stopAmbientSound(), []);

  const enableNotifications = useCallback(async () => {
    const result = await notifications.requestPermission();
    if (result === 'granted') {
      setSettings((s) => ({ ...s, notificationsEnabled: true }));
      showToast('Notifications enabled');
    } else if (result === 'denied') {
      showToast('Notifications were blocked. You can allow them in browser settings.', 'warning');
    }
    return result;
  }, [notifications, setSettings, showToast]);

  const disableNotifications = useCallback(() => {
    setSettings((s) => ({ ...s, notificationsEnabled: false }));
    showToast('Notifications turned off', 'info');
  }, [setSettings, showToast]);

  const sendTestNotification = useCallback(() => {
    const sent = notifications.notify('FocusFlow', {
      body: 'Notifications are working. You’ll be alerted when sessions end.',
      tag: 'focusflow-test',
    });
    showToast(sent ? 'Test notification sent' : 'Could not show a notification in this browser', sent ? 'success' : 'warning');
  }, [notifications, showToast]);

  const closeCompletion = useCallback(() => setCompletion(null), []);
  const startNextFromModal = useCallback(() => {
    setCompletion(null);
    startTimer();
    setView('timer');
  }, [startTimer]);

  const navigate = useCallback((next) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl animate-float dark:bg-violet-700/15" />
        <div className="absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-200/40 blur-3xl animate-float [animation-delay:-5s] dark:bg-fuchsia-800/10" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-indigo-200/30 blur-3xl animate-float [animation-delay:-9s] dark:bg-indigo-800/10" />
      </div>

      <Header view={view} onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} timer={timer} />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 md:pb-12">
        <div key={view} className="animate-fade-in">
          {view === 'timer' ? (
            <TimerDashboard
              timer={timer}
              settings={settings}
              today={today}
              history={history}
              notifications={notifications}
              ambient={{ on: ambientOn, toggle: toggleAmbient, supported: isAudioSupported() }}
              onStart={startTimer}
              onEnableNotifications={enableNotifications}
              onDisableNotifications={disableNotifications}
              onTestNotification={sendTestNotification}
              onViewStats={() => navigate('stats')}
            />
          ) : null}
          {view === 'stats' ? (
            <StatisticsDashboard
              history={history}
              today={today}
              settings={settings}
              onResetToday={resetToday}
              onClearHistory={clearHistory}
            />
          ) : null}
          {view === 'settings' ? (
            <SettingsPanel
              settings={settings}
              onSave={setSettings}
              theme={theme}
              onThemeChange={setTheme}
              notifications={notifications}
              onRequestNotifications={notifications.requestPermission}
              onTestNotification={sendTestNotification}
              onResetToday={resetToday}
              onClearHistory={clearHistory}
              showToast={showToast}
            />
          ) : null}
        </div>
      </main>

      <MobileNavigation view={view} onNavigate={navigate} />

      <CompletionModal
        event={completion}
        today={today}
        longBreakInterval={settings.longBreakInterval}
        onStartNext={startNextFromModal}
        onClose={closeCompletion}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
