/**
 * Command accepted by Matomo's `_paq.push`, mirroring the `Window['_paq']` type.
 */
type PaqCommand = Parameters<Window['_paq']['push']>[0];

/**
 * Pushes a command to Matomo, swallowing any failure.
 *
 * Matomo runs tracking synchronously inside `push`, which can throw when a
 * privacy/anti-fingerprinting browser extension has made `navigator` properties
 * non-configurable. Those failures are analytics noise, not application bugs, so
 * they're logged and ignored here instead of surfacing as unhandled rejections
 * (many `push` calls happen inside async processor promises).
 */
export function trackMatomo(command: PaqCommand): void {
  try {
    window._paq?.push(command);
  } catch (err) {
    console.warn('Matomo tracking failed', err);
  }
}
