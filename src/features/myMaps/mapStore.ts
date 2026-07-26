import { createStore, del, get, set } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';
import { MapMetaSchema } from './model/actions.js';

// Separate database from the offline-map cache: this is working state, not a
// copy the user asked to keep, so purging one must never touch the other.
const store = createStore('fm-myMaps-working', 'kv');

// Keyed per map *and* per tab: two tabs open on the same map each have their own
// working copy, so one can't overwrite the other's stashed track. The tab id
// lives in sessionStorage, which survives a reload and dies with the tab —
// exactly the lifetime of the copy it keys.
const PREFIX = 'map:';

const TAB_KEY = 'fm.myMaps.tab';

function tabId(): string {
  let id: string | null = null;

  try {
    id = sessionStorage.getItem(TAB_KEY);

    if (!id) {
      id = crypto.randomUUID();

      sessionStorage.setItem(TAB_KEY, id);
    }
  } catch {
    // Storage disabled: every load looks like a new tab, so the copy simply
    // never matches and the map is read from the backend.
    id = 'no-session';
  }

  return id;
}

function keyOf(mapId: string): string {
  return `${PREFIX}${tabId()}:${mapId}`;
}

// Enough to cover realistic map-hopping without growing without bound.
const KEEP = 5;

const RecordSchema = z.object({
  meta: MapMetaSchema,
  /** Digest of the map as last loaded or saved (see `fingerprintMapData`). */
  savedFingerprint: z.string(),
  /** The track on screen — the one part of a map the URL can't carry. */
  track: GeoJSONFeatureCollectionSchema.nullable(),
  /** Where that track came from, so restoring it doesn't re-fetch or read dirty. */
  trackUID: z.string().nullable(),
  gpxUrl: z.string().nullable(),
  updatedAt: z.number(),
});

export type MapRecord = z.infer<typeof RecordSchema>;

/**
 * What a reload needs to put a map back exactly as it was: its meta, the digest
 * that says whether it has unsaved changes, and the track. Everything else is
 * restored from the URL.
 *
 * Validated on read, so a record from an older build reads as absent rather than
 * restoring garbage.
 */
export async function getMapRecord(
  mapId: string,
): Promise<MapRecord | undefined> {
  const raw = await get(keyOf(mapId), store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = RecordSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn(`Discarding unreadable map record ${mapId}:`, parsed.error);

    return undefined;
  }

  return parsed.data;
}

export async function putMapRecord(
  record: Omit<MapRecord, 'updatedAt'>,
  now: number,
): Promise<void> {
  const key = keyOf(record.meta.id);

  await set(key, { ...record, updatedAt: now } satisfies MapRecord, store);

  await prune(key, now);
}

// Which maps are held and when they were last touched. A tiny separate entry, so
// pruning never has to read the records themselves — each carries a track that
// can be megabytes.
// Per tab, like the records themselves, so one tab's map-hopping can't evict
// another tab's live working copy.
const indexKey = () => `index:${tabId()}`;

const IndexSchema = z.record(z.string(), z.number());

/**
 * Records the write and drops the least recently used past `KEEP`. Also how
 * copies left behind by closed tabs are eventually reclaimed.
 */
async function prune(key: string, now: number): Promise<void> {
  const key0 = indexKey();

  const index = IndexSchema.safeParse(await get(key0, store)).data ?? {};

  index[key] = now;

  const stale = Object.entries(index)
    .sort(([, a], [, b]) => b - a)
    .slice(KEEP);

  for (const [staleKey] of stale) {
    delete index[staleKey];
  }

  await set(key0, index, store);

  await Promise.all(stale.map(([staleKey]) => del(staleKey, store)));
}

/** Drops a map's working copy — its baseline can no longer be trusted. */
export async function deleteMapRecord(mapId: string): Promise<void> {
  await del(keyOf(mapId), store);
}
