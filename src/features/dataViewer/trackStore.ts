import { createStore, del, get, set } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';

/**
 * The track on screen, kept across a reload.
 *
 * A loaded track is the one thing the URL cannot carry: a file import, a
 * conversion, a finished recording — none of them have anywhere to come back
 * from. My Maps solves that for a track that belongs to a map (`mapStore.ts`);
 * this is the same idea for a track that belongs to nothing.
 *
 * Its own database, so purging either one never takes the other with it.
 */
const store = createStore('fm-trackViewer', 'kv');

// One entry: the track viewer holds one track, and this is it. An archive of
// every track that has ever been open would need a list to manage it and a rule
// for reclaiming space, neither of which anybody has asked for.
const KEY = 'track';

const RecordSchema = z.object({
  /** When the track was stored, for nothing but diagnosis. */
  savedAt: z.number(),
  geojson: GeoJSONFeatureCollectionSchema,
});

export type StoredTrack = z.infer<typeof RecordSchema>;

/**
 * The geojson last written, by reference. `dataViewerSetData` is what triggers a
 * write, and a caller that has already stored the very object being set — the
 * recorder finishing a ride, which must know the write succeeded before it lets
 * the recorder delete anything — would otherwise have it written twice.
 */
let lastStored: unknown = null;

/**
 * Asks the browser to keep this origin's storage rather than reclaim it under
 * pressure, and reports whether it will.
 *
 * Deliberately *not* on the ordinary path. Chrome decides silently, but Firefox
 * asks the user — and prompting for a permission because somebody opened a GPX
 * file would be asking about a hazard they don't have: the file is still on their
 * disk. Only {@link storeTrackDurably} requests it, for the one case where the
 * answer decides whether another copy gets deleted.
 */
async function requestPersistence(): Promise<boolean> {
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

/**
 * Stores the track, so a reload of this history entry puts it back. Nothing is
 * promised about how long the browser keeps it — for an imported file that is
 * enough, since the file itself has not gone anywhere.
 *
 * Throws when the track would not read back. The read validates and discards
 * whatever fails, so writing without the same check would let a caller believe it
 * had a copy of something that is already lost.
 */
export async function storeTrack(geojson: unknown): Promise<void> {
  if (geojson === lastStored) {
    return;
  }

  const record = { savedAt: Date.now(), geojson };

  const parsed = RecordSchema.safeParse(record);

  if (!parsed.success) {
    throw new Error(
      `the track would not read back: ${parsed.error.issues[0]?.message ?? 'invalid'}`,
    );
  }

  await set(KEY, record, store);

  lastStored = geojson;

  markHistoryEntry(true);
}

/**
 * What became of a store the caller is about to act on.
 *
 * - `durable` — written, and the browser has promised to keep it.
 * - `evictable` — written, but the browser may reclaim it under storage pressure.
 * - `unreadable` — not written: it would not have read back.
 */
export type StoreOutcome = 'durable' | 'evictable' | 'unreadable';

/**
 * Stores the track and says exactly how well, for the caller that is about to
 * delete another copy — the GPS recorder finishing a ride. Anything but `durable`
 * is its cue to leave the other copy where it is.
 */
export async function storeTrackDurably(
  geojson: unknown,
): Promise<StoreOutcome> {
  const persisted = await requestPersistence();

  try {
    await storeTrack(geojson);
  } catch (err) {
    console.warn('Refusing to store an unreadable track:', err);

    return 'unreadable';
  }

  return persisted ? 'durable' : 'evictable';
}

/**
 * The stored recording, or undefined when there is none. Validated on read, so a
 * record written by an older build reads as absent rather than restoring
 * something the app can no longer make sense of.
 */
export async function getStoredTrack(): Promise<StoredTrack | undefined> {
  const raw = await get(KEY, store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = RecordSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Discarding unreadable stored track:', parsed.error);

    return undefined;
  }

  lastStored = parsed.data.geojson;

  return parsed.data;
}

export async function deleteStoredTrack(): Promise<void> {
  lastStored = null;

  await del(KEY, store);

  markHistoryEntry(false);
}

/**
 * Flags the current history entry as holding — or no longer holding — the stored
 * track, so a reload of *this* entry puts it back while a fresh visit is left
 * alone. `urlProcessor` carries the flag onto the entries it writes afterwards,
 * and `handleLocationChange` both reads it and, when a fresh load carries none,
 * evicts the entry it refers to.
 *
 * The history entry rather than `localStorage`, because that is the granularity
 * the question actually has: "was I looking at this track when I reloaded?" It
 * also makes the flag the authority — no flag, no track — so the store cannot
 * outlive the session that filled it.
 */
function markHistoryEntry(holding: boolean): void {
  const state = (history.state ?? {}) as { tr?: true };

  if (holding === (state.tr === true)) {
    return;
  }

  try {
    history.replaceState(
      holding ? { ...state, tr: true } : { ...state, tr: undefined },
      '',
      window.location.href,
    );
  } catch {
    // A document opened from a URL `replaceState` refuses (see `index.tsx`); the
    // track is stored either way, it just won't come back by itself on a reload.
  }
}
