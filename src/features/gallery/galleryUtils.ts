import { isHeicFile } from '@shared/heicSupport.js';
import { filterTagCount, type GalleryFilter } from './model/actions.js';

export type GallerySource = 'gallery' | 'wikimedia';

/** Whether a dropped file is a photo the gallery upload takes: JPEG or HEIC/HEIF. */
export function isUploadablePicture(file: File): boolean {
  return (
    file.type === 'image/jpeg' ||
    /\.jpe?g$/i.test(file.name) ||
    isHeicFile(file)
  );
}

export const GALLERY_SOURCES: GallerySource[] = ['gallery', 'wikimedia'];

// The min zoom at which photos appear is the layer's `minZoom` in
// mapDefinitions (Leaflet prunes the tiles below it, like any other layer).

/** The API's query parameters for a photo filter; an array repeats one. */
export function createFilter({
  tag,
  tagIds,
  tagMode,
  userId,
  ratingFrom,
  ratingTo,
  takenAtFrom,
  takenAtTo,
  createdAtFrom,
  createdAtTo,
  pano,
  premium,
  license,
  sources,
}: GalleryFilter) {
  return {
    tag,
    tagId: tagIds,
    // The API counts names and ids together.
    tagMode:
      tagMode === 'all' && filterTagCount({ tag, tagIds }) > 1
        ? tagMode
        : undefined,
    userId,
    ratingFrom,
    ratingTo,
    takenAtFrom: takenAtFrom?.toISOString(),
    takenAtTo: plusDay(takenAtTo)?.toISOString(),
    createdAtFrom: createdAtFrom?.toISOString(),
    createdAtTo: plusDay(createdAtTo)?.toISOString(),
    pano,
    premium,
    license,
    // Expand the "both sources" default (undefined) to an explicit list: the
    // server now treats a missing `sources` param as gallery-only (for mobile
    // app backward compatibility), so every caller must send the sources it
    // wants. An empty array stays empty (all sources deselected → no request).
    sources: sources ?? GALLERY_SOURCES,
  };
}

function plusDay(d: Date | undefined | null): Date | undefined | null {
  if (!d) {
    return d;
  }

  const r = new Date(d);

  r.setDate(r.getDate() + 1);

  return r;
}
