import { get, set } from 'idb-keyval';
import { CacheMode } from './types/common.js';

export async function initCaching() {
  // const [cacheMode, cachingActive] = await Promise.all([
  //   get<CacheMode>('cacheMode'),
  //   get<boolean>('cachingActive'),
  // ]);
  //
  // if (!cachingActive && (!cacheMode || cacheMode === 'networkOnly')) {
  //   const reg = await window.navigator.serviceWorker.getRegistration('/sw.js');
  //
  //   reg?.unregister();
  // } else {
  //   await window.navigator.serviceWorker?.register('/sw.js');
  // }
}

export async function setCacheMode(cacheMode: CacheMode) {
  await set('cacheMode', cacheMode);

  await initCaching();
}

export async function setCachingActive(active: boolean) {
  if (active) {
    await cacheLocal();
  }

  await set('cachingActive', active);

  await initCaching();
}

const OFFLINE_CACHE_NAME = 'offline';

async function cacheLocal() {
  const cache = await caches.open(OFFLINE_CACHE_NAME);

  const res = await fetch('./assets-manifest.json');

  const data = await res.json();

  await cache.addAll(Object.values(data));
}

export async function clearCache() {
  await caches.delete(OFFLINE_CACHE_NAME);

  if (await get('cachingActive')) {
    await cacheLocal();
  }
}
