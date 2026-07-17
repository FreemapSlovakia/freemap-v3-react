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
