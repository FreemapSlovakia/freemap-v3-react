import { createStore, del, get, set } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';
import { MapMetaSchema } from './model/actions.js';

// Separate database from the offline-map cache: this is working state, not a
// copy the user asked to keep, so purging one must never touch the other.
const store = createStore('fm-myMaps-working', 'kv');

// Keyed by map alone. Two tabs open on the same map therefore share one copy and
// the last write wins — acceptable, because both are showing the same map and
// the copy only carries its track. Keying per tab instead would need an id that
// is genuinely per tab (a duplicated tab clones sessionStorage) and a way to
// reclaim copies left by closed tabs, and got both wrong.
const PREFIX = 'map:';

function keyOf(mapId: string): string {
  return PREFIX + mapId;
}

// Which maps are held and when they were last touched. A tiny separate entry, so
// pruning never has to read the records themselves — each carries a track that
// can be megabytes.
const INDEX_KEY = 'index';

// Enough to cover realistic map-hopping without growing without bound.
const KEEP = 5;

const IndexSchema = z.record(z.string(), z.number());

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
  const mapId = record.meta.id;

  await set(
    keyOf(mapId),
    { ...record, updatedAt: now } satisfies MapRecord,
    store,
  );

  await withIndex((index) => {
    index[mapId] = now;
  });
}

/** Drops a map's working copy — its baseline can no longer be trusted. */
export async function deleteMapRecord(mapId: string): Promise<void> {
  await del(keyOf(mapId), store);

  // Also from the index, or the phantom entry would count towards `KEEP` and
  // evict a copy that is still in use.
  await withIndex((index) => {
    delete index[mapId];
  });
}

/**
 * Applies `update` to the index, then drops the records past `KEEP`, least
 * recently touched first.
 */
async function withIndex(
  update: (index: Record<string, number>) => void,
): Promise<void> {
  const index = IndexSchema.safeParse(await get(INDEX_KEY, store)).data ?? {};

  update(index);

  const stale = Object.entries(index)
    .sort(([, a], [, b]) => b - a)
    .slice(KEEP);

  for (const [mapId] of stale) {
    delete index[mapId];
  }

  await set(INDEX_KEY, index, store);

  await Promise.all(stale.map(([mapId]) => del(keyOf(mapId), store)));
}
