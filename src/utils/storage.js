/**
 * Safe LocalStorage wrapper.
 * - Never throws (private mode, disabled storage, quota errors, corrupted JSON).
 * - Falls back to an in-memory store when LocalStorage is unavailable so the app
 *   keeps working for the current page session.
 */

const memoryStore = new Map();
let storageAvailable = null;

export function isStorageAvailable() {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const probe = '__focusflow_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function readRaw(key) {
  if (isStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      /* fall through to memory */
    }
  }
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

/** Read and JSON-parse a value. Returns `fallback` when missing or corrupted. */
export function readStorage(key, fallback = null) {
  const raw = readRaw(key);
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** JSON-serialise and persist a value. Returns true if it reached LocalStorage. */
export function writeStorage(key, value) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(key, serialized);
      return true;
    } catch {
      /* quota exceeded or blocked — keep an in-memory copy */
    }
  }
  memoryStore.set(key, serialized);
  return false;
}

export function removeStorage(key) {
  memoryStore.delete(key);
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
