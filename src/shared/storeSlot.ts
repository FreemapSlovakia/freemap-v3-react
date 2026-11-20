import { useSyncExternalStore } from 'react';

/**
 * A value changing too often for Redux, where every dispatch writes the
 * persisted state and rewrites the URL. Each slot has its own listeners and its
 * own idea of what counts as the same value.
 */
export function makeSlot<T>(same: (a: T, b: T) => boolean) {
  let value: T | null = null;

  const listeners = new Set<() => void>();

  const read = () => value;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    set(next: T | null): void {
      if (value === next || (value && next && same(value, next))) {
        return;
      }

      value = next;

      for (const listener of listeners) {
        listener();
      }
    },

    useValue(): T | null {
      return useSyncExternalStore(subscribe, read, read);
    },
  };
}
