import { useSyncExternalStore } from 'react';
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
  /**
   * The element the picture was decoded through, kept alive only so the decode
   * is. A decoded frame belongs to the browser's cache rather than to the URL,
   * and that cache is evicted under pressure — dropping the last reference
   * invites the decode to be thrown away before the background is painted, and
   * paid for again on the paint path, which is what decoding early avoids.
   */
  image?: HTMLImageElement;
}

let current: PanoramaRenderData | null = null;

let generation = 0;

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

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

/**
 * Subscribed rather than read: a bare call has no reactive input, so the React
 * Compiler caches it for the life of the component and the picture never
 * arrives.
 */
export function usePanoramaRenderData(): PanoramaRenderData | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getPanoramaRenderData,
    getPanoramaRenderData,
  );
}

/** Keeps one render's data, releasing whatever it replaces. */
export function setPanoramaRenderData(data: PanoramaRenderData): void {
  if (current && current.imageUrl !== data.imageUrl) {
    URL.revokeObjectURL(current.imageUrl);
  }

  current = data;

  notify();
}

/** Also gives up the panel, so a pass still in flight drops what it brings. */
export function clearPanoramaRenderData(): void {
  generation++;

  if (current) {
    URL.revokeObjectURL(current.imageUrl);

    current = null;

    notify();
  }
}
