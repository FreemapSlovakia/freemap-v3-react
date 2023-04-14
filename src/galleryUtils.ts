import { GalleryFilter } from './actions/galleryActions';
import { StringDates } from './types/common';

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
}: GalleryFilter): StringDates<GalleryFilter> {
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
