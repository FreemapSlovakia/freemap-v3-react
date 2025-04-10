import { assert } from 'typia';
import { createFilter } from '../galleryUtils.js';
import { httpRequest } from '../httpRequest.js';
import { mapPromise } from '../leafletElementHolder.js';
import { RootState } from '../store.js';
import { objectToURLSearchParams } from '../stringUtils.js';

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
};

export async function fetchPictures(getState: () => RootState) {
  const b = (await mapPromise).getBounds();

  const res = await httpRequest({
    getState,
    url:
      '/gallery/pictures?' +
      objectToURLSearchParams({
        by: 'bbox',
        bbox: `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
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
        ],
      }),
    expectedStatus: 200,
  });

  return assert<Picture[]>(await res.json());
}
