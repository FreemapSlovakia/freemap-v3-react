import { get, set } from 'idb-keyval';
import { is } from 'typescript-is';

type CacheMode = 'networkOnly' | 'networkFirst' | 'cacheFirst' | 'cacheOnly';

const sw = self as any as ServiceWorkerGlobalScope & typeof globalThis;

const resources = self.__WB_MANIFEST;

const FALLBACK_CACHE_NAME = 'offline-html';

const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(FALLBACK_CACHE_NAME)
      .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL])),
  );
});

sw.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      // share target
      if (
        event.request.method === 'POST' &&
        url.origin === location.origin &&
        url.pathname === '/'
      ) {
        const data = await event.request.formData();

        const client = await sw.clients.get(
          event.resultingClientId || event.clientId,
        );

        client?.postMessage({
          freemap: { action: 'shareFile', payload: data.getAll('file') },
        });

        return Response.error();
        // return Response.redirect('/');
      }

      const cacheMode = (await get('cacheMode')) as undefined | CacheMode;

      if (!cacheMode || cacheMode === 'networkOnly') {
        return (await serveFromNetwork(event)) ?? Response.error();
      } else if (cacheMode === 'networkFirst') {
        return (
          (await serveFromNetwork(event, true)) ??
          (await serveFromCache(event)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheFirst') {
        return (
          (await serveFromCache(event)) ??
          (await serveFromNetwork(event, true)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheOnly') {
        return (await serveFromCache(event)) ?? Response.error();
      } else if (cacheMode) {
        if (event.request.method !== 'GET') {
          Response.error();
        }

        const cache = await caches.open('offline');

        const ok = await serveFromCache(event);

        if (ok) {
          return ok;
        } else {
          const response = await fetch(event.request);

          cache.put(event.request, response.clone()); // todo handle async error

          return response;
        }
      }

      return Response.error();
    })(),
  );
});

async function serveFromCache(event: FetchEvent) {
  const cache = await caches.open('offline');

  const url = new URL(event.request.url);

  return cache.match(url.pathname === '/' ? 'index.html' : event.request);
}

async function serveFromNetwork(event: FetchEvent, storeToCache = false) {
  try {
    const response = await fetch(event.request);

    if (storeToCache && response.ok && event.request.method === 'GET') {
      (async () => {
        const cache = await caches.open('offline');

        await cache.put(event.request, response.clone());
      })(); // todo handle async error
    }

    return response;
  } catch (err) {
    const cache = await caches.open(FALLBACK_CACHE_NAME);

    const url = new URL(event.request.url);

    const path =
      url.pathname === '/'
        ? FALLBACK_HTML_URL
        : url?.pathname === FALLBACK_LOGO_URL
        ? FALLBACK_LOGO_URL
        : undefined;

    return path && (await cache.match(path));
  }
}

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    // remove old caches
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== FALLBACK_CACHE_NAME && cacheName !== 'offline') {
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
});

type Action =
  | {
      type: 'setCacheMode';
      payload: {
        clearCache: boolean;
        mode: CacheMode;
      };
    }
  | { type: 'clearCache' }
  | { type: 'cacheStatic' };

async function handleCacheAction(action: Action) {
  switch (action.type) {
    case 'clearCache':
      await caches.delete('offline');

      break;

    case 'cacheStatic': {
      const cache = await caches.open('offline');

      await cache.addAll(resources.map((resource) => resource.url));

      break;
    }

    case 'setCacheMode':
      await set('cacheMode', action.payload.mode);

    default:
      break;
  }
}

sw.addEventListener('message', (e) => {
  if (is<Action>(e.data)) {
    e.waitUntil(handleCacheAction(e.data));
  } else if (is<Action[]>(e.data)) {
    e.waitUntil(Promise.all(e.data.map((a) => handleCacheAction(a))));
  }
});

export default null;
