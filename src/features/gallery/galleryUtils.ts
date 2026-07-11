import type z from 'zod';
import type {
  GalleryColorizeBy,
  GalleryFilter,
  GalleryFilterSchema,
} from './model/actions.js';

export type GallerySource = 'gallery' | 'wikimedia';

export const GALLERY_SOURCES: GallerySource[] = ['gallery', 'wikimedia'];

// Colorize modes for which Wikimedia photos have no per-photo datum, so they
// render neutral. The single source of truth shared by the tile renderer (the
// neutral fill) and the menu (the red "*" hint), so the two can't drift.
export const WIKIMEDIA_NO_DATA_MODES = new Set<GalleryColorizeBy>([
  'userId',
  'takenAt',
  'createdAt',
  'season',
  'license',
]);

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
