/// <reference lib="webworker" />

import { BROWSE_CACHE_NAME } from '@features/cachedMaps/browseCache.js';
import {
  CACHED_TILE_PATH_PREFIX,
  parseCachedTilePath,
} from '@features/cachedMaps/cachedTileUrl.js';
import { isStaticCacheReady, SHELL_URL } from '@shared/offlineStaticCache.js';
import {
  stripTileScale,
  TILE_DRAW_PARAM,
  tileSubdomains,
  withTileScale,
} from '@shared/tileUrl.js';
import { get } from 'idb-keyval';
import {
  applyBrowseState,
  browseCachedTile,
  browseTileResponse,
  dropIndex,
  refreshBrowseState,
} from './browseTileCache.js';
import { fetchTile } from './fetchTile.js';

declare const self: ServiceWorkerGlobalScope;

const FALLBACK_CACHE_NAME = 'offline-html';

const STATIC_CACHE_NAME = 'offline-static';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-flower.svg';

const TILE_CACHE_PREFIX = 'tiles-';

// the scales any layer offers, cheapest lookup first
const TILE_SCALES = [1, 2, 3, 4];

const CACHED_TILE_MAPS_KEY = 'cachedTileMaps';

// how long the app's page may take before the cached one is served instead
const SHELL_TIMEOUT_MS = 3000;

// how long the loading page's "start the saved version" holds for its reload
const SHELL_FROM_CACHE_MS = 10_000;

// The page whose next load skips the network, and until when; see index.ejs.
let shellFromCache: { url: string; until: number } | null = null;

// a build's content-hashed file name, as the nginx `immutable` rule matches it
const HASHED_ASSET_RE = /\.[a-z0-9]{16}\.[^/]+$/;

// how soon an unknown map id may send us back to the database
const RELOAD_MS = 5000;

/** As much of a cached map's metadata as reaching its tile server takes. */
type CachedTileMapMeta = {
  type: string;
  url: string;
  subdomains?: string | string[];
  networkFallback?: boolean;
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

  // Chrome asks for some subresources with `only-if-cached` outside `same-origin`
  // mode, a combination `fetch()` refuses outright. Answering such a request at
  // all would break an image that loads perfectly well without us.
  if (
    event.request.cache === 'only-if-cached' &&
    event.request.mode !== 'same-origin'
  ) {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin && url.pathname.startsWith(CACHED_TILE_PATH_PREFIX)) {
    event.respondWith(serveCachedTile(event));

    return;
  }

  // The browse cache is for tiles a map is drawing. An offline download and the
  // size sampler ask for the very same URLs, and answering those from — or
  // copying them into — that cache would both duplicate the download and, in
  // `cache-only` mode, hand the downloader 404s it would record as tiles it had
  // fetched. An `<img>` says which it is by being one; a tile the map fetches
  // says so with {@link TILE_DRAW_PARAM}.
  if (
    event.request.destination === 'image' ||
    url.searchParams.has(TILE_DRAW_PARAM)
  ) {
    refreshBrowseState();

    // Waiting on settings not read yet is for cross-origin tiles alone: the
    // app's own assets are never tiles, and anything else held for the full
    // timeout would be held for nothing.
    const browsed = browseTileResponse(event, !isSameOrigin);

    if (browsed) {
      event.respondWith(browsed);

      return;
    }
  }

  if (isStaticAssetRequest(url)) {
    event.respondWith(
      event.request.mode === 'navigate' && url.pathname === '/'
        ? serveShell(event)
        : serveStaticAsset(event),
    );
  }
});

/** Same-origin, and not the API: what the offline static cache answers for. */
function isStaticAssetRequest(url: URL): boolean {
  return (
    url.origin === self.location.origin && !url.pathname.startsWith('/api/')
  );
}

/**
 * The app's page from the offline-static cache, if that holds a complete build —
 * the app advances the cached page only once every chunk it names is cached.
 */
async function cachedShell(): Promise<Response | undefined> {
  try {
    return (await isStaticCacheReady())
      ? // served with `Vary: Accept-Language`, which a bare URL can't satisfy
        await caches.match(SHELL_URL, {
          cacheName: STATIC_CACHE_NAME,
          ignoreVary: true,
        })
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The app's page from the network, or the cached one where the network is gone
 * or slower than {@link SHELL_TIMEOUT_MS}: a weak signal stalls rather than
 * fails, and would otherwise keep the app from starting at all.
 */
async function serveShell(event: FetchEvent): Promise<Response> {
  if (
    shellFromCache &&
    Date.now() < shellFromCache.until &&
    // a reload's request keeps the page's `#…`; the page sends its URL without
    shellFromCache.url === event.request.url.split('#')[0]
  ) {
    shellFromCache = null;

    const cached = await cachedShell();

    if (cached) {
      return cached;
    }
  }

  const network = fetch(event.request);

  // the cached page may have answered already; this one then has no taker
  network.catch(() => {});

  const cached = await cachedShell();

  if (!cached) {
    return serveStaticAsset(event, network);
  }

  if (!navigator.onLine) {
    return cached;
  }

  try {
    return (
      (await Promise.race([
        network,
        new Promise<undefined>((resolve) =>
          setTimeout(resolve, SHELL_TIMEOUT_MS),
        ),
      ])) ?? cached
    );
  } catch {
    return cached;
  }
}

async function serveStaticAsset(
  event: FetchEvent,
  network?: Promise<Response>,
): Promise<Response> {
  // A hashed file never changes under its name, so a cached copy is always the
  // right one. The offline-static cache is written only by the app's
  // offlineStaticCache (kept while offline content exists, pruned on redeploy).
  if (HASHED_ASSET_RE.test(new URL(event.request.url).pathname)) {
    const cached = await caches
      .match(event.request, { cacheName: STATIC_CACHE_NAME })
      .catch(() => undefined);

    if (cached) {
      return cached;
    }
  }

  try {
    if (network) {
      return await network;
    }

    return await fetch(event.request);
  } catch (err) {
    // A refresh bypassing caches — offlineStaticCache's — must fail rather than
    // be handed the stale copy, which it would store as the new one.
    if (
      event.request.cache === 'reload' ||
      event.request.cache === 'no-store'
    ) {
      throw err;
    }

    const cached = await caches
      .open(STATIC_CACHE_NAME)
      .then(async (cache) =>
        new URL(event.request.url).pathname === '/'
          ? ((await cache.match(SHELL_URL, { ignoreVary: true })) ??
            cache.match('index.html'))
          : cache.match(event.request),
      );

    if (cached) {
      return cached;
    }

    return (await serveFallback(event)) ?? Response.error();
  }
}

/**
 * The hosts a cached map's tiles can come from, keyed by map id; `null` for a
 * map whose template gives no origin, or which may not reach the network at all.
 * A fetch asks the first, as the download did; the rest are only worth looking
 * under in the browse cache, which a browsing session may have spread over any
 * of them.
 *
 * Refreshed from the database at most every {@link RELOAD_MS}, so an edit the
 * worker was never told about — a dropped `cached-maps-changed` — costs seconds
 * rather than the rest of its life.
 */
let tileSources = new Map<string, string[] | null>();

let tileSourcesReadAt = 0;

let tileSourcesReading: Promise<void> | null = null;

async function tileSource(mapId: string): Promise<string[] | undefined> {
  // No more often than this, lest a pan over a map whose metadata is gone open a
  // transaction per tile. A pan's worth of tiles all miss at once, so they share
  // one read rather than each starting their own.
  const stale = Date.now() - tileSourcesReadAt > RELOAD_MS;

  if (stale) {
    tileSourcesReading ??= readTileSources().finally(() => {
      tileSourcesReading = null;
    });

    const reading = tileSourcesReading;

    // An id that isn't in the table is either a map made since the last read or
    // one that no longer exists, and only a read tells the two apart. A known id
    // has an answer already, so it takes the one in hand and lets the read
    // refresh the table behind it — which is what an edit the worker was never
    // told about eventually arrives by.
    if (!tileSources.has(mapId)) {
      await reading;
    }
  }

  return tileSources.get(mapId) ?? undefined;
}

async function readTileSources(): Promise<void> {
  // The table this read is for. An edit landing meanwhile replaces it, and its
  // own read is on the way — filling the one just discarded would put the
  // pre-edit metadata back for good.
  const target = tileSources;

  try {
    const metas = (await get<CachedTileMapMeta[]>(CACHED_TILE_MAPS_KEY)) ?? [];

    if (target !== tileSources) {
      return;
    }

    for (const { type, url, subdomains, networkFallback } of metas) {
      try {
        tileSources.set(
          type,
          networkFallback === false ? null : tileOrigins(url, subdomains),
        );
      } catch {
        // A map whose url template won't parse doesn't fall through — and is
        // remembered as such, so it doesn't re-read the table per tile.
        tileSources.set(type, null);
      }
    }

    // Only a read that landed starts the window. A failed one leaves the next
    // tile to try again, rather than answering 404 for the next few seconds — an
    // error tile Leaflet never asks about again.
    tileSourcesReadAt = Date.now();
  } catch {
    // IndexedDB unavailable; the caller finds nothing and draws the error tile
  }
}

/**
 * The address as asked for, then the same tile at every other `@Nx`: one screen's
 * DPI decides what a download keeps, another's what browsing kept.
 */
function scaleVariants(url: string): string[] {
  const bare = stripTileScale(url);

  return [
    ...new Set([
      url,
      ...TILE_SCALES.map((scale) => withTileScale(bare, scale)),
    ]),
  ];
}

/** Every host the template can resolve to, in `{s}` order. */
function tileOrigins(
  url: string,
  subdomains: string | string[] | undefined,
): string[] {
  return [
    ...new Set(
      tileSubdomains(subdomains).map(
        (s) => new URL(url.replace('{s}', s)).origin,
      ),
    ),
  ];
}

async function serveCachedTile(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);

  const parsed = parseCachedTilePath(url.pathname);

  if (!parsed) {
    return new Response(null, { status: 404 });
  }

  const { mapId } = parsed;

  const cache = await caches.open(`${TILE_CACHE_PREFIX}${mapId}`);

  // A map holds exactly one `@Nx` variant. Should the request ask for another
  // one — a map whose metadata records no scale, viewed on a screen of a
  // different DPI — serve the variant that is there instead of an error tile.
  //
  // ignoreVary: the entries are keyed by a bare URL with no headers, so any
  // `Vary` on the stored response can never match the tile <img> request's own.
  for (const variant of scaleVariants(event.request.url)) {
    const altCached = await cache.match(variant, { ignoreVary: true });

    if (altCached) {
      return altCached;
    }
  }

  // Nothing stored for this tile: the map is being browsed outside the area it
  // covers, or its download hasn't reached here. A map set to stay sealed has
  // nothing more to show; the rest may look further afield.
  const origins = await tileSource(mapId);

  if (!origins) {
    return new Response(null, { status: 404 });
  }

  const tilePath = `${parsed.path}${url.search}`;

  // Ask the map's own tile server, so a cached map isn't a walled garden while
  // there is a connection; the answer is not written back. Skipped where the
  // connection is known to be gone, which would cost every tile the retry's
  // delay to discover.
  if (navigator.onLine) {
    try {
      return await fetchTile(`${origins[0]}${tilePath}`, {
        // A tile <img> without `crossOrigin` asks in no-cors mode, and an
        // opaque answer is both returnable to it and free of any need for the
        // source layer to send CORS headers. One that does set `crossOrigin`
        // would refuse an opaque response, so it is passed through as-is.
        mode: event.request.mode === 'cors' ? 'cors' : 'no-cors',
        // as downloadTiles does, for providers that authenticate by `Referer`
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
    } catch {
      // offline after all; the browse cache is the one place left to look
    }
  }

  // The same tile may well have been kept while browsing the source layer.
  const browsed = await browseCachedTile(
    event,
    scaleVariants(parsed.path).flatMap((path) =>
      origins.map((origin) => `${origin}${path}${url.search}`),
    ),
  );

  return browsed ?? new Response(null, { status: 404 });
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
          cacheName !== BROWSE_CACHE_NAME &&
          !cacheName.startsWith(TILE_CACHE_PREFIX)
            ? caches.delete(cacheName)
            : undefined,
        ),
      ]);
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data as
    | { type?: string; main?: unknown; url?: unknown }
    | undefined;

  const type = data?.type;

  if (type === 'cached-shell-differs') {
    // the loading page asks whether a build other than its own is held
    const main = data?.main;

    event.waitUntil(
      cachedShell()
        .then((cached) => cached?.text())
        .then((html) =>
          event.ports[0]?.postMessage(
            typeof main === 'string' &&
              main !== '' &&
              html !== undefined &&
              !html.includes(main),
          ),
        )
        .catch(() => event.ports[0]?.postMessage(false)),
    );
  } else if (type === 'browse-cache-changed') {
    event.waitUntil(applyBrowseState());
  } else if (type === 'browse-cache-cleared') {
    dropIndex();
  } else if (type === 'cached-maps-changed') {
    tileSources = new Map();

    tileSourcesReadAt = 0;
  } else if (type === 'shell-from-cache' && typeof data?.url === 'string') {
    shellFromCache = { url: data.url, until: Date.now() + SHELL_FROM_CACHE_MS };

    // the page reloads on this answer, so the flag is set before it navigates
    event.ports[0]?.postMessage(true);
  }
});
