import { MODES, MODE_ORDER } from '../constants.js';

export default function SessionTabs({ mode, onChange }) {
  const activeIndex = Math.max(0, MODE_ORDER.indexOf(mode));
  return (
    <div
      role="tablist"
      aria-label="Session type"
      className="relative grid w-full max-w-md grid-cols-3 rounded-2xl border border-zinc-200/70 bg-zinc-100/70 p-1 dark:border-white/[0.06] dark:bg-white/[0.04]"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-white/10"
        style={{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(${activeIndex * 100}%)` }}
      />
      {MODE_ORDER.map((id) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`relative z-10 whitespace-nowrap rounded-xl px-2 py-2 text-[13px] font-medium transition-colors focus-ring sm:text-sm ${
              active
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {MODES[id].label}
          </button>
        );
      })}
    </div>
  );
}
