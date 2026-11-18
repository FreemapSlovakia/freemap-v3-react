import { describe, expect, it } from 'vitest';
import {
  galleryFilterFromQuery,
  galleryFilterParts,
  isGalleryFilterEmpty,
  parseQuery,
  sameGalleryFilter,
  serializeQuery,
} from './mapContentParts.js';

const roundTrip = (q: string) =>
  serializeQuery(galleryFilterParts(galleryFilterFromQuery(parseQuery(q))));

describe('the photo filter as URL params', () => {
  it('reads back what it writes', () => {
    const filter = {
      userId: 7,
      tag: 'hrad',
      ratingFrom: 2,
      takenAtFrom: new Date('2026-01-02T00:00:00.000Z'),
      pano: false,
      license: ['CC-BY-4.0' as const],
      sources: ['wikimedia' as const],
    };

    const back = galleryFilterFromQuery(
      parseQuery(serializeQuery(galleryFilterParts(filter))),
    );

    expect(sameGalleryFilter(back, filter)).toBe(true);
    expect(back.takenAtFrom).toEqual(filter.takenAtFrom);
  });

  it('drops what it cannot read', () => {
    expect(
      roundTrip('gallery-taken-at-from=nonsense&gallery-license=nope&x=1'),
    ).toBe('');
  });

  it('counts both sources as no restriction', () => {
    expect(isGalleryFilterEmpty({ sources: ['gallery', 'wikimedia'] })).toBe(
      true,
    );

    expect(roundTrip('gallery-source=gallery&gallery-source=wikimedia')).toBe(
      '',
    );
  });

  it('keeps an empty tag', () => {
    expect(roundTrip('gallery-tag=')).toBe('gallery-tag=');
  });
});
