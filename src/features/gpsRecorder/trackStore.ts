import { createStore, del, get, set } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';

// Its own database, not the my-maps working copy: this is a recording the user
// finished and the recorder no longer holds, so purging one must never take the
// other with it.
const store = createStore('fm-gpsRecorder', 'kv');

// One entry. Finishing a recording is "take this ride off the phone and give it
// to me", which is a thing the user then deals with — exports, uploads, or
// discards — before the next one. An archive of every ride would need a list to
// manage it and a rule for reclaiming space; neither is worth inventing until
// somebody wants it.
const KEY = 'track';

const RecordSchema = z.object({
  /** When the recording was taken off the recorder. */
  savedAt: z.number(),
  geojson: GeoJSONFeatureCollectionSchema,
});

export type StoredRecorderTrack = z.infer<typeof RecordSchema>;

/**
 * Asks the browser to keep this origin's storage rather than reclaim it under
 * pressure, and reports whether it will.
 *
 * This is what makes deleting the recorder's copy defensible: without the
 * promise, the browser may evict the only remaining copy of a ride. Chrome grants
 * it silently to an installed or frequently-used site and refuses otherwise, so
 * the answer is a fact about this device, not something to retry.
 */
export async function persistStorage(): Promise<boolean> {
  try {
    return (
      (await navigator.storage?.persisted()) ||
      (await navigator.storage?.persist()) ||
      false
    );
  } catch {
    // No Storage API, or a browser that refuses to answer; either way nothing
    // has been promised.
    return false;
  }
}

export async function putRecorderTrack(
  record: StoredRecorderTrack,
): Promise<void> {
  await set(KEY, record, store);

  markHistoryEntry(true);
}

/**
 * The stored recording, or undefined when there is none. Validated on read, so a
 * record written by an older build reads as absent rather than restoring
 * something the app can no longer make sense of.
 */
export async function getRecorderTrack(): Promise<
  StoredRecorderTrack | undefined
> {
  const raw = await get(KEY, store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = RecordSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Discarding unreadable stored recording:', parsed.error);

    return undefined;
  }

  return parsed.data;
}

export async function deleteRecorderTrack(): Promise<void> {
  await del(KEY, store);

  markHistoryEntry(false);
}

/**
 * Flags the current history entry as holding — or no longer holding — the stored
 * recording, so a reload of *this* entry puts the track back while a fresh visit
 * is left alone. `urlProcessor` carries the flag onto the entries it writes
 * afterwards, and `handleLocationChange` is what reads it.
 *
 * The entry rather than `localStorage`, because that is the granularity the
 * question has: "was I looking at this track when I reloaded?"
 */
function markHistoryEntry(holding: boolean): void {
  const state = (history.state ?? {}) as { rec?: true };

  if (holding === (state.rec === true)) {
    return;
  }

  try {
    history.replaceState(
      holding ? { ...state, rec: true } : { ...state, rec: undefined },
      '',
      window.location.href,
    );
  } catch {
    // A document opened from a URL `replaceState` refuses (see `index.tsx`); the
    // track is stored either way, it just won't come back by itself on a reload.
  }
}
