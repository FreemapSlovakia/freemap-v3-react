import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);

  window.addEventListener('offline', onChange);

  return () => {
    window.removeEventListener('online', onChange);

    window.removeEventListener('offline', onChange);
  };
}

/**
 * Whether the browser has a connection. The single source of truth for the
 * offline state — pair it with `OfflineBadge` / `OfflineAlert` / `OnlineOnlyItem`
 * rather than reading `navigator.onLine` in a component.
 */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.navigator.onLine,
    () => true,
  );
}
