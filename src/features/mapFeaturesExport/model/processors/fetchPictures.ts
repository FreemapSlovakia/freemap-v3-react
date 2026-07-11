import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { createFilter } from '@features/gallery/galleryUtils.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

const PictureSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  id: z.number(),
  takenAt: IsoDateSchema.nullable(),
  createdAt: IsoDateSchema.nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  user: z.string(),
  rating: z.number(),
  premium: z.boolean().optional(),
  hmac: z.string().optional(),
});

export type Picture = z.infer<typeof PictureSchema>;

export async function fetchPictures(getState: () => RootState) {
  const res = await httpRequest({
    getState,
    url:
      '/gallery/pictures?' +
      objectToURLSearchParams({
        by: 'bbox',
        bbox: (await mapPromise).getBounds().toBBoxString(),
        ...createFilter(getState().gallery.filter),
        // The export covers the user's own photos only — Wikimedia rows have no
        // `user`/metadata to export and would fail PictureSchema.
        sources: ['gallery'],
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

  return z.array(PictureSchema).parse(await res.json());
}
