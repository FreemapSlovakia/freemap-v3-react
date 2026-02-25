import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { createFilter } from '@features/gallery/galleryUtils.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';

export type Picture = {
  lat: number;
  lon: number;
  id: number;
  takenAt: number | null;
  createdAt: number | null;
  title: string | null;
  description: string | null;
  tags: string[];
  user: string;
  rating: number;
  premium?: 1;
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

  return assert<Picture[]>(await res.json());
}
