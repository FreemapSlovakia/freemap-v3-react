// Whether `urlProcessor` is allowed to write the browser URL/history.
//
// This is a module-level flag rather than Redux state on purpose: it is private
// coordination state for the URL machinery, not something the UI renders. It is
// suspended while the store is mutated programmatically — during a feature drag
// or while restoring state on popstate — so those intermediate mutations don't
// get pushed as history entries. Keeping it out of Redux means toggling it
// neither floods the action log nor triggers unrelated processors (which used
// to key on the former `enableUpdatingUrl` action).
//
// Starts disabled; enabled once initial startup wiring completes (see
// `app/index.tsx`).
let enabled = false;

export function setUrlUpdatingEnabled(value: boolean) {
  enabled = value;
}

export function isUrlUpdatingEnabled() {
  return enabled;
}

let replaceNext = false;

/**
 * Has the URL writes `write` causes replace the entry rather than add one:
 * content that arrives for the entry shown, as an import of its `track-uid=`.
 */
export function replacingEntry(write: () => void) {
  replaceNext = true;

  try {
    write();
  } finally {
    replaceNext = false;
  }
}

/** Whether the write being made is to replace the entry. */
export const isReplacingEntry = () => replaceNext;
