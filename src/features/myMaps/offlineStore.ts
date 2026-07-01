import { clear, createStore, del, get, keys, set } from 'idb-keyval';
import z from 'zod';
import { type MapData, type MapMeta, MapMetaSchema } from './model/actions.js';
import { MapsLoadResponseSchema } from './model/loadMapDocument.js';

const store = createStore('fm-myMaps-offline', 'kv');

// Meta and data are stored under separate keys so the staleness check can read
// the small meta without deserializing the whole (potentially large) document.
const META_PREFIX = 'meta:';

const DATA_PREFIX = 'data:';

const LIST_KEY = 'list';

// Stored meta/data/snapshots are validated on read through the same schemas as
// the network responses, so a future `MapData` divergence is handled by the
// schemas' compatibility transformers rather than reading stale/garbage shapes.
const StoredMetaSchema = MapMetaSchema;

const StoredDataSchema = MapsLoadResponseSchema.shape.data;

const StoredListSchema = z.array(MapMetaSchema);

export interface OfflineMap {
  meta: MapMeta;
  data: MapData;
}

/** Ids of maps the user flagged for offline use (presence in the store is the flag). */
export async function getOfflineMapIds(): Promise<string[]> {
  const ks = await keys(store);

  return ks
    .filter(
      (k): k is string => typeof k === 'string' && k.startsWith(META_PREFIX),
    )
    .map((k) => k.slice(META_PREFIX.length));
}

export async function getOfflineMapCount(): Promise<number> {
  return (await getOfflineMapIds()).length;
}

/** Reads just the cached meta — cheap; use for staleness checks. */
export async function getOfflineMapMeta(
  id: string,
): Promise<MapMeta | undefined> {
  const raw = await get(META_PREFIX + id, store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = StoredMetaSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn(`Discarding unreadable offline map meta ${id}:`, parsed.error);

    return undefined;
  }

  return parsed.data;
}

export async function getOfflineMap(
  id: string,
): Promise<OfflineMap | undefined> {
  const [rawMeta, rawData] = await Promise.all([
    get(META_PREFIX + id, store),
    get(DATA_PREFIX + id, store),
  ]);

  if (rawMeta === undefined || rawData === undefined) {
    return undefined;
  }

  const meta = StoredMetaSchema.safeParse(rawMeta);

  const data = StoredDataSchema.safeParse(rawData);

  if (!meta.success || !data.success) {
    // An unreadable copy (corrupt or from an incompatible version) is treated as
    // a cache miss so it re-fetches when online.
    console.warn(
      `Discarding unreadable offline map ${id}:`,
      meta.success ? data.error : meta.error,
    );

    return undefined;
  }

  return { meta: meta.data, data: data.data };
}

export async function putOfflineMap(map: OfflineMap): Promise<void> {
  // Write data first, then meta: meta presence is the "fully cached" marker
  // (getOfflineMapIds keys off it), so a failed data write never leaves a map
  // listed as available but unloadable.
  await set(DATA_PREFIX + map.meta.id, map.data, store);

  await set(META_PREFIX + map.meta.id, map.meta, store);
}

export async function deleteOfflineMap(id: string): Promise<void> {
  // Remove meta first so the map stops counting as cached immediately.
  await del(META_PREFIX + id, store);

  await del(DATA_PREFIX + id, store);
}

/** Last-seen map list, so the My Maps list still renders offline. */
export async function getOfflineMapListSnapshot(): Promise<
  MapMeta[] | undefined
> {
  const raw = await get(LIST_KEY, store);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = StoredListSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Discarding unreadable offline map list:', parsed.error);

    return undefined;
  }

  return parsed.data;
}

export async function saveOfflineMapListSnapshot(
  maps: MapMeta[],
): Promise<void> {
  await set(LIST_KEY, maps, store);
}

/** Drops every offline map and the list snapshot (e.g. on logout). */
export async function clearOfflineMaps(): Promise<void> {
  await clear(store);
}
