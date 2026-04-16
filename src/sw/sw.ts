/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const FALLBACK_CACHE_NAME = 'offline-html';

const STATIC_CACHE_NAME = 'offline-static';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

const TILE_CACHE_PREFIX = 'tiles-';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(FALLBACK_CACHE_NAME)
      .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL])),
  );

  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    url.protocol === 'http:' &&
    (url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1') &&
    url.port === '8111'
  ) {
    return;
  }

  if (event.request.method !== 'GET' || !/^https?:/.test(event.request.url)) {
    return;
  }

  const isStaticAsset =
    url.origin === self.location.origin && !url.pathname.startsWith('/api/');

  if (isStaticAsset) {
    event.respondWith(serveStaticAsset(event));
  } else {
    event.respondWith(serveTileOrNetwork(event));
  }
});

async function serveStaticAsset(event: FetchEvent): Promise<Response> {
  try {
    const response = await fetch(event.request);

    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);

      cache.put(event.request, response.clone());
    }

    return response;
  } catch {
    const cached = await caches
      .open(STATIC_CACHE_NAME)
      .then((cache) =>
        cache.match(
          new URL(event.request.url).pathname === '/'
            ? 'index.html'
            : event.request,
        ),
      );

    if (cached) {
      return cached;
    }

    return (await serveFallback(event)) ?? Response.error();
  }
}

async function serveTileOrNetwork(event: FetchEvent): Promise<Response> {
  const cacheNames = await caches.keys();

  const tileCaches = cacheNames.filter((name) =>
    name.startsWith(TILE_CACHE_PREFIX),
  );

  for (const cacheName of tileCaches) {
    const cache = await caches.open(cacheName);

    const cached = await cache.match(event.request);

    if (cached) {
      return cached;
    }
  }

  try {
    return await fetch(event.request);
  } catch {
    return Response.error();
  }
}

async function serveFallback(event: FetchEvent) {
  const cache = await caches.open(FALLBACK_CACHE_NAME);

  const url = new URL(event.request.url);

  const path =
    url.pathname === '/'
      ? FALLBACK_HTML_URL
      : url.pathname === FALLBACK_LOGO_URL
        ? FALLBACK_LOGO_URL
        : undefined;

  return path && cache.match(path);
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all([
        self.clients.claim(),

        ...cacheNames.map((cacheName) =>
          cacheName !== FALLBACK_CACHE_NAME &&
          cacheName !== STATIC_CACHE_NAME &&
          !cacheName.startsWith(TILE_CACHE_PREFIX)
            ? caches.delete(cacheName)
            : undefined,
        ),
      ]);
    })(),
  );
});
