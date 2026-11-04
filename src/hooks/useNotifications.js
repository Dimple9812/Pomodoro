import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  sendNotification,
} from '../utils/notifications.js';

/**
 * Tracks the browser's notification permission and exposes helpers.
 * Permission can change outside the app (browser settings), so it is
 * re-checked when the window regains focus and via the Permissions API.
 */
export function useNotifications() {
  const [permission, setPermission] = useState(getNotificationPermission);

  useEffect(() => {
    if (!isNotificationSupported()) return undefined;
    const refresh = () => setPermission(getNotificationPermission());
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    let status = null;
    let cancelled = false;
    navigator.permissions
      ?.query?.({ name: 'notifications' })
      .then((result) => {
        if (cancelled) return;
        status = result;
        status.onchange = refresh;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      if (status) status.onchange = null;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback((title, options) => sendNotification(title, options), []);

  return {
    permission,
    isSupported: permission !== 'unsupported',
    requestPermission,
    notify,
  };
}
