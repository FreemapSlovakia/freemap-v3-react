import type { User } from '@features/auth/model/types.js';
import { isPremium } from '@features/premium/premium.js';
import { LatLonSchema } from '@shared/types/common.js';
import z from 'zod';

/** As the API's limits. */
export const MAX_PLACES = 20;

export const FREE_PLACES = 1;

export const PlaceSchema = z.object({
  ...LatLonSchema.shape,
  /** The API's id; negative while being created. */
  id: z.number(),
  name: z.string(),
});

export type Place = z.infer<typeof PlaceSchema>;

/** Drops a malformed entry rather than the whole list. */
export const PlacesCompatSchema = z.array(z.unknown()).transform((items) =>
  items.flatMap((item) => {
    const parsed = PlaceSchema.safeParse(item);

    return parsed.success ? [parsed.data] : [];
  }),
);

/** How many places the user may have. */
export function placeLimit(user: User | null): number {
  return isPremium(user) ? MAX_PLACES : FREE_PLACES;
}
