export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`card ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          {subtitle ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
