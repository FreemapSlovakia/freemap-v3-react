import { get, set } from 'idb-keyval';

const FALLBACK_CACHE_NAME = 'offline-html';

const OFFLINE_CACHE_NAME = 'offline';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

export type CacheMode =
  | 'networkOnly'
  | 'networkFirst'
  | 'cacheFirst'
  | 'cacheOnly';

export type SwCacheAction =
  | {
      type: 'setCacheMode';
      payload: CacheMode;
    }
  | { type: 'clearCache' }
  | { type: 'setCachingActive'; payload: boolean };

export async function prepareOffline() {
  window.caches
    .open(FALLBACK_CACHE_NAME)
    .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL]));

  Promise.all([get('cacheMode'), get('cachingActive')]).then(
    ([cacheMode, cachingActive]: [
      CacheMode | undefined,
      boolean | undefined,
    ]) => {
      if (cachingActive || (cacheMode ?? 'networkOnly') === 'networkOnly') {
        // cache SW
        window.navigator.serviceWorker
          ?.register('/sw.js', { scope: '/' })
          .catch((e) => {
            console.warn('Error registering service worker:', e);
          });
      }
    },
  );
}

export async function applyCacheMode(cacheMode: CacheMode) {
  return window.navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'setCacheMode',
      payload: cacheMode,
    });
  });
}

export async function applyCachingActive(cachingActive: boolean) {
  return window.navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'setCachingActive',
      payload: cachingActive,
    });
  });
}

export async function clearCache() {
  return window.navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({ type: 'clearCache' });
  });
}

async function cacheLocal() {
  const cache = await window.caches.open(OFFLINE_CACHE_NAME);

  await cache.addAll(resources.map((resource) => resource.url));
}

async function handleCacheAction(action: SwCacheAction) {
  switch (action.type) {
    case 'clearCache':
      await caches.delete(OFFLINE_CACHE_NAME);

      if (await get('cachingActive')) {
        await cacheLocal();
      }

      break;

    case 'setCachingActive':
      if (action.payload) {
        await cacheLocal();

        // TODO notify clients that static resources has been cached
      }

      await set('cachingActive', action.payload);

      break;

    case 'setCacheMode':
      await set('cacheMode', action.payload);

      break;

    default:
      break;
  }
}
