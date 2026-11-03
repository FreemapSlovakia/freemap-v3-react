import { useSyncExternalStore } from 'react';

/** Calls `onChange` whenever `devicePixelRatio` changes: page zoom, or a move to another screen. */
export function watchDevicePixelRatio(onChange: () => void): () => void {
  let query: MediaQueryList | undefined;

  // A query matches one ratio only, so each change re-arms it at the new one.
  const watch = () => {
    query?.removeEventListener('change', handle);

    query = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );

    query.addEventListener('change', handle);
  };

  const handle = () => {
    watch();

    onChange();
  };

  watch();

  return () => query?.removeEventListener('change', handle);
}

const getSnapshot = () => window.devicePixelRatio || 1;

/** `devicePixelRatio`, re-rendering as it changes. */
export function useDevicePixelRatio(): number {
  return useSyncExternalStore(watchDevicePixelRatio, getSnapshot);
}
