/**
 * Wikimedia Commons photos share the gallery's navigable id space but must be
 * distinguishable from own-gallery photos. They are represented internally as a
 * negative id (`-pageId`); this maps such an id to its server path segment
 * (`w<pageId>`), leaving own-gallery ids untouched.
 */
export function pictureIdToPath(id: number): string {
  return id < 0 ? `w${-id}` : String(id);
}

/** Whether an internal gallery id refers to a Wikimedia Commons photo. */
export function isWikimediaId(id: number): boolean {
  return id < 0;
}
