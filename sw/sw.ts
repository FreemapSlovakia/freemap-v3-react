declare var self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown };

const CACHE_NAME = 'offline-html';

const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL])),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const url = new URL(event.request.url);

      if (event.request.method === 'POST' && url.pathname === '/') {
        const data = await event.request.formData();

        const client = await self.clients.get(
          event.resultingClientId || event.clientId,
        );

        client?.postMessage({
          freemap: { action: 'shareFile', payload: data.getAll('file') },
        });

        return Response.redirect('/');
      }

      try {
        return await fetch(event.request);
      } catch (err) {
        return (
          (await cache.match(
            url.pathname === '/'
              ? FALLBACK_HTML_URL
              : url?.pathname === FALLBACK_LOGO_URL
              ? FALLBACK_LOGO_URL
              : '_',
          )) || err
        );
      }
    }),
  );
});

// remove old caches

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
});

export default self.__WB_MANIFEST; // 2 in 1 - makes it a module and use __WB_MANIFEST required by WorkboxPlugin.InjectManifest
