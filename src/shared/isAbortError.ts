/**
 * Tells an abort/cancellation apart from a real failure. `AbortSignal`, the
 * File System Access picker and `navigator.share` all reject with an
 * `AbortError` `DOMException` when the operation was cancelled rather than
 * failing.
 */
export function isAbortError(err: unknown): err is DOMException {
  return err instanceof DOMException && err.name === 'AbortError';
}
