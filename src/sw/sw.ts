/// <reference lib="webworker" />

import {
  CACHED_TILE_PATH_PREFIX,
  parseCachedTilePath,
} from '@features/cachedMaps/cachedTileUrl.js';
import { pickSubdomain } from '@shared/tileUrl.js';
import { get } from 'idb-keyval';

declare const self: ServiceWorkerGlobalScope;

const FALLBACK_CACHE_NAME = 'offline-html';

const STATIC_CACHE_NAME = 'offline-static';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

const TILE_CACHE_PREFIX = 'tiles-';

const SCALE_SUFFIX_RE = /@\d+(?:\.\d+)?x$/;

// the scales any layer offers, cheapest lookup first
const TILE_SCALES = [1, 2, 3, 4];

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

// how soon an unknown map id may send us back to the database
const RELOAD_MS = 5000;

/** As much of a cached map's metadata as reaching its tile server takes. */
type CachedTileMapMeta = {
  type: string;
  url: string;
  subdomains?: string | string[];
};

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

/**
 * The origin a cached map's tiles came from, keyed by map id, `null` for a map
 * whose template gives none. A map's id is random and its source layer can't be
 * changed once it exists, so an entry can never go stale — only an id that isn't
 * in the table yet reads the database, which is what picks up a map made since.
 */
const tileOrigins = new Map<string, string | null>();

let tileOriginsReadAt = 0;

async function tileOrigin(mapId: string): Promise<string | undefined> {
  // An id that isn't in the table is either a map made since the last read or
  // one that no longer exists, and only a read tells the two apart — so read
  // again, but no more often than this, lest a pan over a map whose metadata is
  // gone open a transaction per tile.
  if (!tileOrigins.has(mapId) && Date.now() - tileOriginsReadAt > RELOAD_MS) {
    tileOriginsReadAt = Date.now();

    try {
      const metas =
        (await get<CachedTileMapMeta[]>(CACHED_TILE_MAPS_KEY)) ?? [];

      for (const { type, url, subdomains } of metas) {
        try {
          // `{s}` resolved as the download resolves it: it asked one host only,
          // so that is the one the tiles are known to have come from
          tileOrigins.set(
            type,
            new URL(url.replace('{s}', pickSubdomain(subdomains))).origin,
          );
        } catch {
          // A map whose url template won't parse doesn't fall through — and is
          // remembered as such, so it doesn't re-read the table per tile.
          tileOrigins.set(type, null);
        }
      }
    } catch {
      return undefined;
    }
  }

  return tileOrigins.get(mapId) ?? undefined;
}

async function serveCachedTile(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);

  const parsed = parseCachedTilePath(url.pathname);

  if (!parsed) {
    return new Response(null, { status: 404 });
  }

  const { mapId } = parsed;

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
  const bareUrl = event.request.url.replace(SCALE_SUFFIX_RE, '');

  for (const scale of TILE_SCALES) {
    const alt = scale === 1 ? bareUrl : `${bareUrl}@${scale}x`;

    if (alt === event.request.url) {
      continue;
    }

    const altCached = await cache.match(alt, { ignoreVary: true });

    if (altCached) {
      return altCached;
    }
  }

  // Nothing stored for this tile: the map is being browsed outside the area it
  // covers, or its download hasn't reached here. Ask the map's own tile server,
  // so a cached map isn't a walled garden while there is a connection. The
  // answer is not written back — the map stays exactly the artifact that was
  // downloaded.
  const origin = await tileOrigin(mapId);

  if (origin) {
    try {
      return await fetch(`${origin}${parsed.path}${url.search}`, {
        // A tile <img> without `crossOrigin` asks in no-cors mode, and an
        // opaque answer is both returnable to it and free of any need for the
        // source layer to send CORS headers. One that does set `crossOrigin`
        // would refuse an opaque response, so it is passed through as-is.
        mode: event.request.mode === 'cors' ? 'cors' : 'no-cors',
        // as downloadTiles does, for providers that authenticate by `Referer`
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
    } catch {
      // offline — draw the error tile, as before
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
