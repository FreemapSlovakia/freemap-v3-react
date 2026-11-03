import { startPerfSpan, watchPerfFrame } from '@shared/perfProbe.js';

/**
 * The recorder's binding of the shared probe — see `@shared/perfProbe.js` for
 * what it does and why. The phases here are the recorder's passes: the catch-up
 * page, the parse of it, the dispatch that merges it, the frame that draws it.
 */
export function startRecorderSpan(
  phase: string,
  waitMs?: number,
): (n?: number) => void {
  return startPerfSpan('gps-recorder', phase, waitMs);
}

export function watchRecorderFrame(phase: string, n: number): void {
  watchPerfFrame('gps-recorder', phase, n);
}
