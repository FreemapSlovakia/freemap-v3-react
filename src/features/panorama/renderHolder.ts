import type { PanoramaDepth } from './depth.js';

/**
 * The two parts of a render the store can't hold: an object URL that has to be
 * revoked when it is replaced, and a distance buffer of several megabytes.
 * `PanoramaRenderInfo.id` says which render the store's copy describes, so a
 * stale component can tell it is looking at one that has since been replaced.
 */
export interface PanoramaRenderData {
  id: number;
  imageUrl: string;
  depth: PanoramaDepth | null;
}

let current: PanoramaRenderData | null = null;

let generation = 0;

/**
 * Claims the panel for a pass about to start, and names its picture.
 *
 * A pass reads its claim back before it dispatches, because it cannot be
 * aborted all the way to the end: `httpRequest` stops watching for
 * cancellation the moment the response headers arrive, leaving the body read
 * and the depth decode — a multi-million-iteration loop on a detailed render —
 * outside anyone's reach. Without the check a click landing in that window
 * would be overwritten by the render it replaced.
 */
export function claimPanoramaRender(): number {
  return ++generation;
}

export function isCurrentPanoramaRender(claim: number): boolean {
  return claim === generation;
}

export function getPanoramaRenderData(): PanoramaRenderData | null {
  return current;
}

/** Keeps one render's data, releasing whatever it replaces. */
export function setPanoramaRenderData(data: PanoramaRenderData): void {
  if (current && current.imageUrl !== data.imageUrl) {
    URL.revokeObjectURL(current.imageUrl);
  }

  current = data;
}

/** Also gives up the panel, so a pass still in flight drops what it brings. */
export function clearPanoramaRenderData(): void {
  generation++;

  if (current) {
    URL.revokeObjectURL(current.imageUrl);

    current = null;
  }
}
