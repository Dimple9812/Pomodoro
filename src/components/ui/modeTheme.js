/** Visual styling per session mode (full class strings so Tailwind can detect them). */
export const MODE_THEME = {
  focus: {
    gradient: ['#7c3aed', '#c026d3'],
    text: 'text-violet-600 dark:text-violet-300',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
    glow: 'from-violet-400/50 via-fuchsia-300/40 to-purple-300/30 dark:from-violet-600/40 dark:via-fuchsia-600/25 dark:to-purple-700/20',
    button: 'from-violet-600 to-fuchsia-500 shadow-violet-500/40',
    dot: 'bg-violet-500',
  },
  shortBreak: {
    gradient: ['#0d9488', '#5eead4'],
    text: 'text-teal-600 dark:text-teal-300',
    chip: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200',
    glow: 'from-teal-300/50 via-emerald-200/40 to-cyan-200/30 dark:from-teal-600/35 dark:via-emerald-600/20 dark:to-cyan-700/20',
    button: 'from-teal-600 to-emerald-500 shadow-teal-500/40',
    dot: 'bg-teal-500',
  },
  longBreak: {
    gradient: ['#4f46e5', '#818cf8'],
    text: 'text-indigo-600 dark:text-indigo-300',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
    glow: 'from-indigo-300/50 via-blue-200/40 to-violet-200/30 dark:from-indigo-600/40 dark:via-blue-700/20 dark:to-violet-700/20',
    button: 'from-indigo-600 to-blue-500 shadow-indigo-500/40',
    dot: 'bg-indigo-500',
  },
};
