/// <reference lib="webworker" />

import {
  CACHED_TILE_PATH_PREFIX,
  parseCachedTileMapId,
} from '@features/cachedMaps/cachedTileUrl.js';

declare const self: ServiceWorkerGlobalScope;

const FALLBACK_CACHE_NAME = 'offline-html';

const STATIC_CACHE_NAME = 'offline-static';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

const TILE_CACHE_PREFIX = 'tiles-';

const SCALE_SUFFIX_RE = /@\d+(?:\.\d+)?x$/;

// the scales any layer offers, cheapest lookup first
const TILE_SCALES = [1, 2, 3, 4];

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

  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin && url.pathname.startsWith(CACHED_TILE_PATH_PREFIX)) {
    event.respondWith(serveCachedTile(event));

    return;
  }

  const isStaticAsset = isSameOrigin && !url.pathname.startsWith('/api/');

  if (isStaticAsset) {
    event.respondWith(serveStaticAsset(event));
  }
});

async function serveStaticAsset(event: FetchEvent): Promise<Response> {
  // Online: pass through to the network. The offline-static cache is owned
  // entirely by the app's offlineStaticCache (populated only when offline
  // content exists, refreshed on redeploy), so the SW never writes it — it's a
  // pure reader when the network is gone.
  try {
    return await fetch(event.request);
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

async function serveCachedTile(event: FetchEvent): Promise<Response> {
  const mapId = parseCachedTileMapId(new URL(event.request.url).pathname);

  if (!mapId) {
    return new Response(null, { status: 404 });
  }

  const cache = await caches.open(`${TILE_CACHE_PREFIX}${mapId}`);

  // ignoreVary: the entries are keyed by a bare URL Request with no headers, so
  // any `Vary` on the stored response can never match the real tile <img>
  // request's headers.
  const cached = await cache.match(event.request, { ignoreVary: true });

  if (cached) {
    return cached;
  }

  // A map holds exactly one `@Nx` variant. Should the request ask for another
  // one — a map whose metadata records no scale, viewed on a screen of a
  // different DPI — serve the variant that is there instead of an error tile.
  const url = event.request.url.replace(SCALE_SUFFIX_RE, '');

  for (const scale of TILE_SCALES) {
    const alt = scale === 1 ? url : `${url}@${scale}x`;

    if (alt === event.request.url) {
      continue;
    }

    const altCached = await cache.match(alt, { ignoreVary: true });

    if (altCached) {
      return altCached;
    }
  }

  return new Response(null, { status: 404 });
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
