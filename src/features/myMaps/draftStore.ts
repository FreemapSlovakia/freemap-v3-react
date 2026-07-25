import { createStore, del, get, set } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';

// Separate database from the offline-map cache: this is short-lived working
// state, not a copy the user asked to keep, so purging one must never touch the
// other.
const store = createStore('fm-myMaps-draft', 'kv');

// A single slot — only one map can be active at a time, so it can't accumulate
// and never needs pruning.
const KEY = 'track';

const StoredTrackSchema = z.object({
  mapId: z.string(),
  // `null` records that the dirty map genuinely has no track, so an entry that is
  // missing altogether means the stash was lost rather than never needed.
  trackGeojson: GeoJSONFeatureCollectionSchema.nullable(),
});

export type StoredTrack = z.infer<typeof StoredTrackSchema>;

/**
 * The imported track of a map with unsaved changes.
 *
 * Everything else a map holds is already restored on reload — drawing, route,
 * objects and gallery filters ride in the URL, custom layers and display
 * preferences in localStorage. The track is the one part that fits nowhere else
 * (it can be megabytes), so without this it would vanish on reload and then be
 * erased from the stored map by the next save.
 *
 * Validated on read, so a shape from an older build reads as absent rather than
 * restoring garbage.
 */
export async function getTrackDraft(): Promise<StoredTrack | undefined> {
  const raw = await get(KEY, store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = StoredTrackSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Discarding unreadable track draft:', parsed.error);

    return undefined;
  }

  return parsed.data;
}

export async function putTrackDraft(draft: StoredTrack): Promise<void> {
  await set(KEY, draft, store);
}

export async function clearTrackDraft(): Promise<void> {
  await del(KEY, store);
}
