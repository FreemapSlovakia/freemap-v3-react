/**
 * The overlay image, which the store can't hold: an object URL has to be revoked
 * when it is replaced.
 *
 * A render checks its claim before it installs anything, because it cannot be
 * aborted all the way to the end — `httpRequest` stops watching for
 * cancellation the moment the response headers arrive.
 */
let currentUrl: string | null = null;

let generation = 0;

export function claimViewshedRender(): number {
  return ++generation;
}

export function isCurrentViewshedRender(claim: number): boolean {
  return claim === generation;
}

/** Gives up the render in flight, leaving the overlay on the map alone. */
export function dropViewshedRenderClaim(): void {
  generation++;
}

export function getViewshedImageUrl(): string | null {
  return currentUrl;
}

/** Keeps one render's image, releasing whatever it replaces. */
export function setViewshedImageUrl(url: string): void {
  if (currentUrl && currentUrl !== url) {
    URL.revokeObjectURL(currentUrl);
  }

  currentUrl = url;
}

/** Also gives up the overlay, so a render still in flight drops what it brings. */
export function clearViewshedImageUrl(): void {
  generation++;

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);

    currentUrl = null;
  }
}
