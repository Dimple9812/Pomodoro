import { useEffect, useMemo, useState } from 'react';
import { Bell, Database, Keyboard, Minus, Moon, Palette, Plus, RotateCcw, Sun, Timer, Trash2, Zap, Volume2 } from 'lucide-react';
import Card, { CardHeader } from './ui/Card.jsx';
import Switch from './ui/Switch.jsx';
import NotificationManager from './NotificationManager.jsx';
import { DEFAULT_SETTINGS, SETTING_LIMITS } from '../constants.js';
import { sanitizeSettings, validateSettingValue } from '../utils/validation.js';
import { playCompletionSound, unlockAudio } from '../utils/sound.js';

const NUMERIC_KEYS = Object.keys(SETTING_LIMITS);

const toDraft = (settings) => ({
  ...settings,
  ...Object.fromEntries(NUMERIC_KEYS.map((key) => [key, String(settings[key])])),
});

function NumberField({ id, value, onChange, error }) {
  const { min, max, label, unit } = SETTING_LIMITS[id];
  const numeric = Number(value);
  const valid = Number.isFinite(numeric) && String(value).trim() !== '';
  const step = (delta) => {
    const base = valid ? Math.round(numeric) : min;
    onChange(String(Math.min(max, Math.max(min, base + delta))));
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {label}
      </label>
      <div
        className={`flex h-11 items-center rounded-xl border bg-white transition-colors focus-within:ring-2 focus-within:ring-violet-500/40 dark:bg-white/[0.03] ${
          error ? 'border-rose-400 dark:border-rose-500/60' : 'border-zinc-200 dark:border-white/10'
        }`}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={valid && numeric <= min}
          className="grid h-full w-10 place-items-center text-zinc-400 hover:text-violet-600 disabled:opacity-30 dark:hover:text-violet-300"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          className="no-spinner w-full min-w-0 bg-transparent text-center text-sm font-semibold text-zinc-900 tabular-nums outline-none dark:text-white"
        />
        <span className="pr-1 text-xs text-zinc-400">{unit}</span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={valid && numeric >= max}
          className="grid h-full w-10 place-items-center text-zinc-400 hover:text-violet-600 disabled:opacity-30 dark:hover:text-violet-300"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <p
        id={`${id}-hint`}
        className={`mt-1.5 text-xs ${error ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500'}`}
      >
        {error ?? `${min}–${max} ${unit}`}
      </p>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  onSave,
  theme,
  onThemeChange,
  notifications,
  onRequestNotifications,
  onTestNotification,
  onResetToday,
  onClearHistory,
  showToast,
}) {
  const [draft, setDraft] = useState(() => toDraft(settings));

  const errors = useMemo(
    () =>
      Object.fromEntries(
        NUMERIC_KEYS.map((key) => [key, validateSettingValue(key, draft[key])]).filter(([, error]) => error),
      ),
    [draft],
  );
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = useMemo(() => {
    const original = toDraft(settings);
    return Object.keys(original).some((key) => String(original[key]) !== String(draft[key]));
  }, [draft, settings]);

  // Pick up external changes (e.g. another tab) when there are no local edits.
  useEffect(() => {
    if (!isDirty) setDraft(toDraft(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const update = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleNotificationToggle = async (next) => {
    if (!next) {
      update('notificationsEnabled')(false);
      return;
    }
    const result = await onRequestNotifications();
    if (result === 'granted') {
      update('notificationsEnabled')(true);
    } else if (result === 'denied') {
      showToast('Notifications are blocked in your browser settings.', 'warning');
    } else if (result === 'unsupported') {
      showToast('This browser does not support notifications.', 'warning');
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (hasErrors) return;
    const next = sanitizeSettings({
      ...draft,
      ...Object.fromEntries(NUMERIC_KEYS.map((key) => [key, Number(draft[key])])),
    });
    onSave(next);
    setDraft(toDraft(next));
    showToast('Settings saved');
  };

  const handleRestoreDefaults = () => {
    setDraft(toDraft({ ...DEFAULT_SETTINGS, notificationsEnabled: draft.notificationsEnabled }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24 md:pb-20" noValidate>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Tune FocusFlow to the way you work. Saved in this browser.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardHeader icon={Timer} title="Timer" subtitle="Session lengths and your daily target" />
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="focusMinutes" value={draft.focusMinutes} onChange={update('focusMinutes')} error={errors.focusMinutes} />
            <NumberField id="shortBreakMinutes" value={draft.shortBreakMinutes} onChange={update('shortBreakMinutes')} error={errors.shortBreakMinutes} />
            <NumberField id="longBreakMinutes" value={draft.longBreakMinutes} onChange={update('longBreakMinutes')} error={errors.longBreakMinutes} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField id="longBreakInterval" value={draft.longBreakInterval} onChange={update('longBreakInterval')} error={errors.longBreakInterval} />
            <NumberField id="dailyGoal" value={draft.dailyGoal} onChange={update('dailyGoal')} error={errors.dailyGoal} />
          </div>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            Changes apply to the next session. A session already in progress keeps its length.
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={Zap} title="Auto-start" subtitle="Move through sessions without clicking" />
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
              <Switch
                id="autoStartBreaks"
                label="Automatically start breaks"
                description="Begin the break as soon as a focus session ends."
                checked={draft.autoStartBreaks}
                onChange={update('autoStartBreaks')}
              />
              <Switch
                id="autoStartFocus"
                label="Automatically start focus sessions"
                description="Begin the next focus session when a break ends."
                checked={draft.autoStartFocus}
                onChange={update('autoStartFocus')}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={Palette} title="Appearance" subtitle="Applied instantly" />
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={theme === id}
                  onClick={() => onThemeChange(id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all focus-ring ${
                    theme === id
                      ? 'border-violet-400 bg-violet-50 text-violet-700 ring-1 ring-violet-400 dark:border-violet-400/60 dark:bg-violet-500/10 dark:text-violet-200'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <CardHeader icon={Bell} title="Notifications & sound" subtitle="How FocusFlow gets your attention" />
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            <Switch
              id="notificationsEnabled"
              label="Browser notifications"
              description={
                notifications.permission === 'denied'
                  ? 'Blocked by your browser — see instructions below.'
                  : notifications.permission === 'unsupported'
                    ? 'Not supported in this browser.'
                    : 'Alert me when a session ends, even in a background tab.'
              }
              checked={draft.notificationsEnabled && notifications.permission === 'granted'}
              onChange={handleNotificationToggle}
              disabled={notifications.permission === 'denied' || notifications.permission === 'unsupported'}
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Switch
                  id="soundEnabled"
                  label="Completion sound"
                  description="A soft chime when a session finishes."
                  checked={draft.soundEnabled}
                  onChange={update('soundEnabled')}
                />
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  unlockAudio();
                  playCompletionSound();
                }}
                aria-label="Preview completion sound"
                title="Preview sound"
              >
                <Volume2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
          {notifications.permission === 'denied' || notifications.permission === 'unsupported' ? (
            <div className="mt-4 rounded-2xl bg-amber-50/70 p-4 dark:bg-amber-500/[0.06]">
              <NotificationManager compact permission={notifications.permission} enabled={false} />
            </div>
          ) : null}
          {notifications.permission === 'granted' ? (
            <button type="button" className="btn-secondary mt-4" onClick={onTestNotification}>
              <Bell className="h-4 w-4" aria-hidden="true" /> Send test notification
            </button>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={Keyboard} title="Keyboard shortcuts" subtitle="Available on the Timer page" />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Space', 'Start / pause'],
                ['R', 'Reset timer'],
                ['F', 'Focus mode'],
                ['B', 'Break mode'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2.5">
                  <dt>
                    <kbd className="kbd">{key}</kbd>
                  </dt>
                  <dd className="text-zinc-600 dark:text-zinc-300">{label}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={Database} title="Data" subtitle="Everything stays in this browser’s LocalStorage" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (window.confirm('Reset today’s statistics?')) {
                    onResetToday();
                    showToast('Today’s statistics were reset', 'info');
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset today’s stats
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  if (window.confirm('Clear all session history? This cannot be undone.')) {
                    onClearHistory();
                    showToast('Session history cleared', 'info');
                  }
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all history
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4 md:bottom-6">
        <div className="mx-auto flex max-w-6xl justify-end">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/90 p-2 pl-4 shadow-xl backdrop-blur-xl sm:w-auto dark:border-white/10 dark:bg-ink-800/90">
            <p className="flex-1 text-xs text-zinc-500 sm:mr-4 dark:text-zinc-400">
              {hasErrors ? 'Fix the highlighted fields' : isDirty ? 'Unsaved changes' : 'All changes saved'}
            </p>
            <button type="button" className="btn-ghost" onClick={handleRestoreDefaults}>
              Defaults
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setDraft(toDraft(settings))}
              disabled={!isDirty}
            >
              Discard
            </button>
            <button type="submit" className="btn-primary" disabled={!isDirty || hasErrors}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
