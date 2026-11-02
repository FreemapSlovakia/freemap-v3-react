import type { ExternalTarget } from '@app/store/actions.js';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

type Opener = (where: ExternalTarget) => void;

let current: Opener | null = null;

const listeners = new Set<() => void>();

function set(opener: Opener | null) {
  current = opener;

  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * How the selection's toolbar opens its feature elsewhere — what a `j` chord
 * reaches instead of the map's view while that toolbar is up.
 */
export function selectionOpener(): Opener | null {
  return current;
}

/** Whether a selection holds the `j` chords now. */
export function useHasSelectionOpener(): boolean {
  return useSyncExternalStore(subscribe, () => current !== null);
}

/** Registers `open` as the selection's opener while it is set and mounted. */
export function useSelectionOpener(open: Opener | null | undefined): void {
  const latest = useRef(open);

  useLayoutEffect(() => {
    latest.current = open;
  });

  const enabled = Boolean(open);

  // Registered by presence alone, so a new `open` on every zoom step doesn't
  // re-register and re-render the main menu.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const opener: Opener = (where) => latest.current?.(where);

    set(opener);

    return () => {
      if (current === opener) {
        set(null);
      }
    };
  }, [enabled]);
}
