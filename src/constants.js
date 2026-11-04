/**
 * App-wide constants. Kept free of React/JSX so they can be imported by
 * pure utilities and unit tests running in Node.
 */

export const MODES = {
  focus: {
    id: 'focus',
    label: 'Focus',
    longLabel: 'Focus Session',
    settingKey: 'focusMinutes',
  },
  shortBreak: {
    id: 'shortBreak',
    label: 'Short Break',
    longLabel: 'Short Break',
    settingKey: 'shortBreakMinutes',
  },
  longBreak: {
    id: 'longBreak',
    label: 'Long Break',
    longLabel: 'Long Break',
    settingKey: 'longBreakMinutes',
  },
};

export const MODE_ORDER = ['focus', 'shortBreak', 'longBreak'];

export const TIMER_STATUS = {
  idle: 'idle',
  running: 'running',
  paused: 'paused',
};

export const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  dailyGoal: 8,
  notificationsEnabled: false,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartFocus: false,
};

/** Validation limits for every numeric setting. */
export const SETTING_LIMITS = {
  focusMinutes: { min: 1, max: 180, label: 'Focus duration', unit: 'min' },
  shortBreakMinutes: { min: 1, max: 60, label: 'Short break', unit: 'min' },
  longBreakMinutes: { min: 1, max: 90, label: 'Long break', unit: 'min' },
  longBreakInterval: { min: 2, max: 12, label: 'Long break after', unit: 'sessions' },
  dailyGoal: { min: 1, max: 30, label: 'Daily goal', unit: 'pomodoros' },
};

export const BOOLEAN_SETTINGS = [
  'notificationsEnabled',
  'soundEnabled',
  'autoStartBreaks',
  'autoStartFocus',
];

export const STORAGE_KEYS = {
  settings: 'focusflow:settings',
  timer: 'focusflow:timer',
  history: 'focusflow:history',
  theme: 'focusflow:theme',
  lastCompletion: 'focusflow:last-completion',
};

/** Keep the history bounded so LocalStorage never grows without limit. */
export const MAX_HISTORY_ENTRIES = 3000;

/** How often the UI re-reads the clock while a session is running. */
export const TICK_MS = 250;

export const MOTIVATIONAL_MESSAGES = {
  focus: [
    'One task. Full attention. You’ve got this.',
    'Deep work compounds. Protect these minutes.',
    'Small, focused steps build remarkable things.',
    'Silence the noise — the next 25 minutes are yours.',
    'Progress over perfection. Just keep going.',
    'Clarity comes from doing. Start the next step.',
  ],
  shortBreak: [
    'Stand up, stretch, and breathe deeply.',
    'Look at something far away to rest your eyes.',
    'Grab some water — your brain will thank you.',
    'A short pause makes the next session sharper.',
  ],
  longBreak: [
    'You earned this. Step away and fully recharge.',
    'Take a walk, get some fresh air, reset your mind.',
    'Great work on that cycle. Rest is part of the process.',
  ],
};
