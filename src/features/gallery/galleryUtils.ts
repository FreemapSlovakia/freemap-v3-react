import type z from 'zod';
import type {
  GalleryColorizeBy,
  GalleryFilter,
  GalleryFilterSchema,
} from './model/actions.js';

export type GallerySource = 'gallery' | 'wikimedia';

export const GALLERY_SOURCES: GallerySource[] = ['gallery', 'wikimedia'];

// Colorize modes for which Wikimedia photos carry no datum at all, so the whole
// source renders neutral. Only license qualifies: it isn't in any Commons dump
// (see the backend importer), whereas capturedAt/uploadedAt/authorId are
// imported, so date/season/author colorize per photo (a photo still missing its
// EXIF date falls back to neutral individually, like an own photo would). The
// single source of truth shared by the tile renderer (the neutral fill) and the
// menu (the red "*" hint), so the two can't drift.
export const WIKIMEDIA_NO_DATA_MODES = new Set<GalleryColorizeBy>(['license']);

// The min zoom at which photos appear is the layer's `minZoom` in
// mapDefinitions (Leaflet prunes the tiles below it, like any other layer).

/** The sources to request, defaulting to all when the filter selects none. */
export function resolveSources(
  filterSources: GallerySource[] | undefined,
): GallerySource[] {
  return filterSources ?? GALLERY_SOURCES;
}

export function createFilter({
  tag,
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
}: GalleryFilter): z.input<typeof GalleryFilterSchema> {
  return {
    tag,
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
    sources,
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
