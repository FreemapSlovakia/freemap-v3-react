import { createStore, delMany, get, keys, set } from 'idb-keyval';
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
//
// The key carries when the record was last touched — `map:<updatedAt>:<mapId>` —
// so pruning can order the records from `keys()` alone, without deserializing a
// track that can be megabytes. The timestamp comes first and is read up to the
// first separator, so a map id containing one can't be misparsed.
const PREFIX = 'map:';

export function keyOf(mapId: string, updatedAt: number): string {
  return `${PREFIX}${updatedAt}:${mapId}`;
}

export type StoredKey = { key: string; mapId: string; updatedAt: number };

export function parseKey(key: unknown): StoredKey | undefined {
  if (typeof key !== 'string' || !key.startsWith(PREFIX)) {
    return undefined;
  }

  const rest = key.slice(PREFIX.length);

  const sep = rest.indexOf(':');

  const updatedAt = Number(rest.slice(0, sep));

  return sep === -1 || !Number.isFinite(updatedAt)
    ? undefined
    : { key, mapId: rest.slice(sep + 1), updatedAt };
}

async function storedKeys(): Promise<StoredKey[]> {
  return (await keys(store))
    .map(parseKey)
    .filter((entry): entry is StoredKey => entry !== undefined);
}

// Enough to cover realistic map-hopping without growing without bound.
export const KEEP = 5;

const RecordSchema = z.object({
  meta: MapMetaSchema,
  /** Digest of the map as last loaded or saved (see `fingerprintState`). */
  savedFingerprint: z.string(),
  /** The track on screen — the one part of a map the URL can't carry. */
  track: GeoJSONFeatureCollectionSchema.nullable(),
  /** Where that track came from, so restoring it doesn't re-fetch or read dirty. */
  trackUID: z.string().nullable(),
  gpxUrl: z.string().nullable(),
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
  const entries = (await storedKeys()).filter((entry) => entry.mapId === mapId);

  if (entries.length === 0) {
    return undefined;
  }

  // Pruning leaves one key per map; should a write have been interrupted, the
  // newest is the one that counts.
  const newest = entries.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a));

  const parsed = RecordSchema.safeParse(await get(newest.key, store));

  if (!parsed.success) {
    console.warn(`Discarding unreadable map record ${mapId}:`, parsed.error);

    return undefined;
  }

  return parsed.data;
}

export function putMapRecord(record: MapRecord, now: number): Promise<void> {
  return enqueue(async () => {
    await set(keyOf(record.meta.id, now), record, store);

    // After the write, so an interruption leaves a superseded key rather than no
    // record at all; the next prune reclaims it.
    await prune();
  });
}

/** Drops a map's working copy — its baseline can no longer be trusted. */
export function deleteMapRecord(mapId: string): Promise<void> {
  return enqueue(async () => {
    await delKeys((entry) => entry.mapId === mapId);
  });
}

/**
 * Drops every working copy but `keepMapId`'s. Called on logout: the records
 * carry map names and tracks — private ones included — and are served without a
 * server check, so a shared browser must not offer them to whoever logs in next.
 *
 * A public map stays connected across logout, and its copy is kept so the
 * processor doesn't simply write it back: its name and track are on screen
 * either way, and dropping it would lose the track on the next reload.
 */
export function clearMapRecords(keepMapId?: string): Promise<void> {
  return enqueue(async () => {
    await delKeys((entry) => entry.mapId !== keepMapId);
  });
}

/**
 * Which keys a prune drops: records a newer write for the same map superseded,
 * and the maps past `KEEP`, least recently touched first.
 *
 * Pure, and decided from the keys alone — a record is never read just to find
 * out it can stay, which is the point of carrying the timestamp in the key.
 */
export function staleKeys(entries: StoredKey[]): string[] {
  const newest = new Map<string, StoredKey>();

  const stale: string[] = [];

  for (const entry of entries) {
    const seen = newest.get(entry.mapId);

    if (!seen) {
      newest.set(entry.mapId, entry);
    } else if (entry.updatedAt > seen.updatedAt) {
      newest.set(entry.mapId, entry);

      stale.push(seen.key);
    } else {
      stale.push(entry.key);
    }
  }

  for (const entry of [...newest.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(KEEP)) {
    stale.push(entry.key);
  }

  return stale;
}

async function prune(): Promise<void> {
  const stale = staleKeys(await storedKeys());

  if (stale.length) {
    await delMany(stale, store);
  }
}

async function delKeys(match: (entry: StoredKey) => boolean): Promise<void> {
  const doomed = (await storedKeys()).filter(match).map((entry) => entry.key);

  if (doomed.length) {
    await delMany(doomed, store);
  }
}

// Writes are fire-and-forget at the call sites, so they are serialized here —
// not for the records themselves, which are keyed per map and safe to race, but
// so that logout's clear can't be overtaken by a write already in flight and
// leave the departing account's map behind.
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);

  queue = run.catch(() => undefined);

  return run;
}
