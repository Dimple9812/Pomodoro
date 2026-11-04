/**
 * Thin, defensive wrapper around the native Notifications API.
 *
 * Notifications are delivered while the page is open — including when the tab
 * is in the background or the window is minimised. They cannot be delivered
 * once the browser (or this tab) has been closed, because this app has no
 * backend / push server.
 */

const ICON = '/icon-192.png';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** 'unsupported' | 'default' | 'granted' | 'denied' */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return window.Notification.permission;
}

/**
 * Ask for permission — only when it has not been decided yet, so the browser
 * prompt is never shown repeatedly. Supports both the promise and the legacy
 * callback forms of `Notification.requestPermission`.
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  const current = window.Notification.permission;
  if (current !== 'default') return current;
  try {
    return await new Promise((resolve) => {
      const maybePromise = window.Notification.requestPermission(resolve);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve, () => resolve(window.Notification.permission));
      }
    });
  } catch {
    return window.Notification.permission;
  }
}

/** Show a notification. Returns the Notification or null if it could not be shown. */
export function sendNotification(title, { body, tag, requireInteraction = false } = {}) {
  if (getNotificationPermission() !== 'granted') return null;
  try {
    const notification = new window.Notification(title, {
      body,
      tag,
      icon: ICON,
      badge: ICON,
      requireInteraction,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return notification;
  } catch {
    // Some mobile browsers only allow notifications through a service worker.
    return null;
  }
}

export function getCompletionNotification(completedMode, nextMode) {
  if (completedMode === 'focus') {
    return {
      title: 'FocusFlow',
      body:
        nextMode === 'longBreak'
          ? 'Focus session completed! You’ve earned a long break.'
          : 'Focus session completed! Time for a break.',
    };
  }
  if (completedMode === 'longBreak') {
    return { title: 'Long Break Complete', body: 'Feeling refreshed? Ready to start a new cycle?' };
  }
  return { title: 'Break Complete', body: 'Your break is over. Ready to focus again?' };
}
