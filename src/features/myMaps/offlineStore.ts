import { clear, createStore, del, get, keys, set } from 'idb-keyval';
import type { MapData, MapMeta } from './model/actions.js';

const store = createStore('fm-myMaps-offline', 'kv');

const MAP_PREFIX = 'map:';

const LIST_KEY = 'list';

export interface OfflineMap {
  meta: MapMeta;
  data: MapData;
}

/** Ids of maps the user flagged for offline use (presence in the store is the flag). */
export async function getOfflineMapIds(): Promise<string[]> {
  const ks = await keys(store);

  return ks
    .filter(
      (k): k is string => typeof k === 'string' && k.startsWith(MAP_PREFIX),
    )
    .map((k) => k.slice(MAP_PREFIX.length));
}

export async function getOfflineMapCount(): Promise<number> {
  return (await getOfflineMapIds()).length;
}

export async function getOfflineMap(
  id: string,
): Promise<OfflineMap | undefined> {
  return get<OfflineMap>(MAP_PREFIX + id, store);
}

export async function putOfflineMap(map: OfflineMap): Promise<void> {
  await set(MAP_PREFIX + map.meta.id, map, store);
}

export async function deleteOfflineMap(id: string): Promise<void> {
  await del(MAP_PREFIX + id, store);
}

/** Last-seen map list, so the My Maps list still renders offline. */
export async function getOfflineMapListSnapshot(): Promise<
  MapMeta[] | undefined
> {
  return get<MapMeta[]>(LIST_KEY, store);
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
