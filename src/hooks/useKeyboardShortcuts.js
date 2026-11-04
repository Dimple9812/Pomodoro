import { useEffect, useRef } from 'react';

function isTypingTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Space – start/pause · R – reset · F – focus mode · B – break mode.
 * Ignored while typing in form fields or when a modifier key is held.
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      let action = null;
      if (event.code === 'Space' || event.key === ' ') action = 'onToggle';
      else if (event.key === 'r' || event.key === 'R') action = 'onReset';
      else if (event.key === 'f' || event.key === 'F') action = 'onFocus';
      else if (event.key === 'b' || event.key === 'B') action = 'onBreak';

      const handler = action && handlersRef.current[action];
      if (!handler) return;
      event.preventDefault();
      if (event.repeat) return;
      handler();
    };

    // Stop Space from also "clicking" whichever button currently has focus.
    const onKeyUp = (event) => {
      if ((event.code === 'Space' || event.key === ' ') && !isTypingTarget(event.target)) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);
}
