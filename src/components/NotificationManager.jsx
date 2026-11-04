import { Bell, BellOff, BellRing, ShieldAlert } from 'lucide-react';
import Card from './ui/Card.jsx';

/**
 * Explains and controls browser-notification state:
 * unsupported · default (ask) · granted+on · granted+off · denied (how to fix).
 */
export default function NotificationManager({ permission, enabled, onEnable, onDisable, onTest, compact = false }) {
  let icon = Bell;
  let title;
  let body;
  let actions = null;
  let tone = 'violet';

  if (permission === 'unsupported') {
    icon = BellOff;
    tone = 'zinc';
    title = 'Notifications unavailable';
    body = 'This browser doesn’t support desktop notifications. You’ll still get in-app alerts and sounds.';
  } else if (permission === 'denied') {
    icon = ShieldAlert;
    tone = 'amber';
    title = 'Notifications are blocked';
    body = (
      <>
        To allow them, click the lock or settings icon next to the address bar, open{' '}
        <strong className="font-semibold">Site settings → Notifications</strong>, choose{' '}
        <strong className="font-semibold">Allow</strong>, then reload this page.
      </>
    );
  } else if (permission === 'granted' && enabled) {
    icon = BellRing;
    tone = 'emerald';
    title = 'Notifications are on';
    body = 'You’ll be alerted when a session ends — even if this tab is in the background. Keep the tab open.';
    actions = (
      <>
        <button type="button" className="btn-secondary" onClick={onTest}>
          Send test
        </button>
        <button type="button" className="btn-ghost" onClick={onDisable}>
          Turn off
        </button>
      </>
    );
  } else {
    title = permission === 'granted' ? 'Notifications are off' : 'Get notified';
    body = 'Receive a browser notification when a focus session or break ends, even while you work in another tab.';
    actions = (
      <button type="button" className="btn-primary" onClick={onEnable}>
        <Bell className="h-4 w-4" aria-hidden="true" /> Enable notifications
      </button>
    );
  }

  const tones = {
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    zinc: 'bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400',
  };
  const Icon = icon;

  const content = (
    <div className="flex gap-3.5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
        {actions ? <div className="mt-3.5 flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );

  if (compact) return content;
  return <Card className="p-5 sm:p-6">{content}</Card>;
}
