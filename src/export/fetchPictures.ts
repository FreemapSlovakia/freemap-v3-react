import { createFilter } from 'fm3/galleryUtils';
import { httpRequest } from 'fm3/httpRequest';
import { mapPromise } from 'fm3/leafletElementHolder';
import { RootState } from 'fm3/store';
import { objectToURLSearchParams } from 'fm3/stringUtils';
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
