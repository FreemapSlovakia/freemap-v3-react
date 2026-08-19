/**
 * Nudges the service worker to re-read what the app has just written to
 * IndexedDB. Only a nudge: it re-reads on its own schedule anyway, and every
 * change it is told about here is also one it can work out for itself from what
 * it reads — a message lost to a worker that is starting or being replaced
 * therefore costs a delay, never correctness.
 */
export function notifyServiceWorker(
  type: 'browse-cache-changed' | 'browse-cache-cleared' | 'cached-maps-changed',
): void {
  navigator.serviceWorker?.controller?.postMessage({ type });
}
