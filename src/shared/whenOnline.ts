/** Runs `retry` once the connection is back, or after `delayMs` if it never left. */
export function whenOnline(retry: () => void, delayMs: number): void {
  if (navigator.onLine) {
    setTimeout(retry, delayMs);
  } else {
    window.addEventListener('online', retry, { once: true });
  }
}
