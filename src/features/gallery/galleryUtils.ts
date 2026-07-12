import type z from 'zod';
import type {
  GalleryColorizeBy,
  GalleryFilter,
  GalleryFilterSchema,
} from './model/actions.js';

export type GallerySource = 'gallery' | 'wikimedia';

export const GALLERY_SOURCES: GallerySource[] = ['gallery', 'wikimedia'];

// Colorize modes for which Wikimedia photos carry no datum at all, so the whole
// source would render neutral. Now empty: date/author/license (via the image +
// SDC dumps) are all imported, so every mode colorizes per photo — a photo
// missing a given value falls back individually (neutral for date/season, the
// fallback license color for license), exactly like an own photo. Kept as the
// single source of truth shared by the tile renderer and the menu "*" hint.
export const WIKIMEDIA_NO_DATA_MODES = new Set<GalleryColorizeBy>();

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
