import { CacheMode, SwCacheAction } from 'fm3/types/common';
import { get, set } from 'idb-keyval';

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

  sw.skipWaiting();
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

        // return Response.error();
        return Response.redirect('/');
      }

      const cacheMode = (await get('cacheMode')) as undefined | CacheMode;

      if (!cacheMode || cacheMode === 'networkOnly') {
        return (await serveFromNetwork(event)) ?? Response.error();
      } else if (cacheMode === 'networkFirst') {
        return (
          (await serveFromNetwork(event)) ??
          (await serveFromCache(event)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheFirst') {
        return (
          (await serveFromCache(event)) ??
          (await serveFromNetwork(event)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheOnly') {
        return (await serveFromCache(event)) ?? Response.error();
      } else if (cacheMode) {
        if (
          event.request.method !== 'GET' ||
          !/^https?:/.test(event.request.url)
        ) {
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

async function serveFromNetwork(event: FetchEvent) {
  try {
    const [response, cachingActive] = await Promise.all([
      fetch(event.request),
      get('cachingActive'),
    ]);

    if (
      cachingActive &&
      response.ok &&
      event.request.method === 'GET' &&
      /^https?:/.test(event.request.url)
    ) {
      const clonedResponse = response.clone();

      (async () => {
        const cache = await caches.open('offline');

        await cache.put(event.request, clonedResponse);
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
    (async () => {
      await Promise.all([
        sw.clients.claim(), // TODO maybe try to eliminate this

        (async () => {
          const cacheNames = await caches.keys();

          // remove old caches
          cacheNames.map((cacheName) => {
            if (cacheName !== FALLBACK_CACHE_NAME && cacheName !== 'offline') {
              return caches.delete(cacheName);
            }
          });
        })(),
      ]);
    })(),
  );
});

async function handleCacheAction(action: SwCacheAction) {
  switch (action.type) {
    case 'clearCache':
      await caches.delete('offline');

      break;

    case 'setCachingActive':
      if (action.payload) {
        const cache = await caches.open('offline');

        await cache.addAll(resources.map((resource) => resource.url));

        // TODO notify clients that static resources has been cached
      }

      await set('cachingActive', action.payload);

      break;

    case 'setCacheMode':
      await set('cacheMode', action.payload);

    default:
      break;
  }
}

sw.addEventListener('message', (e) => {
  if (Array.isArray(e.data)) {
    e.waitUntil(Promise.all(e.data.map((a) => handleCacheAction(a))));
  } else if (typeof e.data === 'object' && e.data) {
    e.waitUntil(handleCacheAction(e.data));
  }
});

export default null;
