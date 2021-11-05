import { del, get, set } from 'idb-keyval';

const sw = self as any as ServiceWorkerGlobalScope & typeof globalThis;

const resources = self.__WB_MANIFEST;

const CACHE_NAME = 'offline-html';

const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL])),
  );
});

sw.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      if (event.request.method === 'POST' && url.pathname === '/') {
        const data = await event.request.formData();

        const client = await sw.clients.get(
          event.resultingClientId || event.clientId,
        );

        client?.postMessage({
          freemap: { action: 'shareFile', payload: data.getAll('file') },
        });

        return Response.error(); // Response.redirect('/');
      }

      const cacheOn = await get('cacheOn');

      if (cacheOn) {
        const cache = await caches.open('offline');

        const ok = await cache.match(
          url.pathname === '/' ? 'index.html' : event.request,
        );

        if (ok) {
          console.log('FOUND', url.pathname);

          return ok;
        } else {
          console.log('NOT FOUND', url.pathname);

          const response = await fetch(event.request);

          cache.put(event.request, response.clone()); // todo handle async error

          return response;
        }
      }

      try {
        return await fetch(event.request);
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);

        return (
          (await cache.match(
            url.pathname === '/'
              ? FALLBACK_HTML_URL
              : url?.pathname === FALLBACK_LOGO_URL
              ? FALLBACK_LOGO_URL
              : '_',
          )) || Response.error()
        );
      }
    })(),
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    // remove old caches
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== 'offline') {
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
});

sw.addEventListener('message', (e) => {
  const cmd = e.data;

  e.waitUntil(
    (async () => {
      if (cmd === 'fillCache') {
        await caches
          .open('offline')
          .then((cache) =>
            cache.addAll(resources.map((resource) => resource.url)),
          );

        await set('cacheOn', true);
      } else if (cmd === 'emptyCache') {
        await caches.delete('offline');

        await del('cacheOn');
      }
    })(),
  );
});

export default null;
