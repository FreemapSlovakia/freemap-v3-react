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
  // 0 = own gallery photo, 1 = Wikimedia Commons. Wikimedia rows carry the
  // metadata below but no title/description/tags/user (those are Commons-API
  // per-photo), so those are absent for them.
  source: z.number().default(0),
  takenAt: IsoDateSchema.nullish(),
  createdAt: IsoDateSchema.nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  tags: z
    .array(z.string())
    .nullish()
    .transform((t) => t ?? []),
  user: z.string().nullish(),
  rating: z.number(),
  license: z.string().nullish(),
  azimuth: z.number().nullish(),
  premium: z.boolean().optional(),
  hmac: z.string().optional(),
});

export type Picture = z.infer<typeof PictureSchema>;

// `source` value for a Wikimedia Commons photo (own photos are 0).
export const SOURCE_WIKIMEDIA = 1;

/** Commons file-page permalink from a Commons pageId. */
export function commonsFileUrl(pageId: number): string {
  return `https://commons.wikimedia.org/?curid=${pageId}`;
}

/**
 * The links to export for a picture, derived once so the GPX/GeoJSON/KML
 * writers stay in sync. Wikimedia photos have only the Commons pageId (no direct
 * image URL), so they link to the Commons file page + the freemap viewer; own
 * photos embed their image endpoint. The discriminated `wikimedia` flag lets
 * callers narrow which URL is present.
 */
export type PictureExportLinks =
  | {
      wikimedia: true;
      webUrl: string;
      commonsUrl: string;
      imageUrl?: undefined;
    }
  | {
      wikimedia: false;
      webUrl: string;
      imageUrl: string;
      commonsUrl?: undefined;
    };

export function pictureExportUrls({
  id,
  source,
  hmac,
}: Picture): PictureExportLinks {
  if (source === SOURCE_WIKIMEDIA) {
    return {
      wikimedia: true,
      webUrl: `${location.origin}/#show=gallery-viewer/-${id}`,
      commonsUrl: commonsFileUrl(id),
    };
  }

  let imageUrl = `${process.env['API_URL']}/gallery/pictures/${id}/image`;

  if (hmac) {
    imageUrl += `&hmac=${encodeURIComponent(hmac)}`;
  }

  return {
    wikimedia: false,
    webUrl: `${location.origin}?image=${id}`,
    imageUrl,
  };
}

export async function fetchPictures(getState: () => RootState) {
  const res = await httpRequest({
    getState,
    url:
      '/gallery/pictures?' +
      objectToURLSearchParams({
        by: 'bbox',
        bbox: (await mapPromise).getBounds().toBBoxString(),
        // Sources come from the gallery filter (both by default); Wikimedia
        // photos export the metadata we have (dates, rating, license, azimuth,
        // location) and link back to Commons / the freemap viewer.
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
          'license',
          'azimuth',
        ],
      }),
    expectedStatus: 200,
  });

  return z.array(PictureSchema).parse(await res.json());
}
