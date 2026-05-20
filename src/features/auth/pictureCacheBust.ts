import { useSyncExternalStore } from 'react';

let value = 0;

const listeners = new Set<() => void>();

export function bumpPictureCacheBust(): void {
  value++;

  for (const listener of listeners) {
    listener();
  }
}

export function usePictureCacheBust(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => value,
    () => value,
  );
}
