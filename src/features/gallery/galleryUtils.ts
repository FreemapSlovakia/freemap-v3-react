import type z from 'zod';
import type { GalleryFilter, GalleryFilterSchema } from './model/actions.js';

export type GallerySource = 'gallery' | 'wikimedia';

export const GALLERY_SOURCES: GallerySource[] = ['gallery', 'wikimedia'];

// The min zoom at which photos appear is the layer's `minZoom` in
// mapDefinitions (Leaflet prunes the tiles below it, like any other layer).

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
