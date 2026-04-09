import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { createFilter } from '@features/gallery/galleryUtils.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';
import { StringDates } from '../../../../shared/types/common.js';

export type Picture = {
  lat: number;
  lon: number;
  id: number;
  takenAt: Date | null;
  createdAt: Date | null;
  title: string | null;
  description: string | null;
  tags: string[];
  user: string;
  rating: number;
  premium?: boolean;
  hmac?: string;
};

export async function fetchPictures(getState: () => RootState) {
  const res = await httpRequest({
    getState,
    url:
      '/gallery/pictures?' +
      objectToURLSearchParams({
        by: 'bbox',
        bbox: (await mapPromise).getBounds().toBBoxString(),
        ...createFilter(getState().gallery.filter),
        fields: [
          'id',
          'title',
          'description',
          'takenAt',
          'createdAt',
          'rating',
          'tags',
          'user',
          'premium',
          'hmac',
        ],
      }),
    expectedStatus: 200,
  });

  return assert<StringDates<Picture>[]>(await res.json()).map(p => ({
    ...p,
    createdAt: p.createdAt == null ? p.createdAt : new Date(p.createdAt),
    takenAt: p.takenAt == null ? p.takenAt : new Date(p.takenAt),
  }));
}
