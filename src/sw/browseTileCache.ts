/**
 * The cache that ordinary map browsing fills: one Cache Storage bucket for every
 * tile layer, under a global policy the app writes to IndexedDB. Separate from
 * the per-map offline caches in `sw.ts`, which are downloaded artifacts.
 *
 * The index — what each tile costs and when it was last served — is held in
 * memory for the worker's lifetime and written back on a debounce; expiry and
 * the size cap both need every entry, and a database read per tile served would
 * double what serving one costs.
 */

import {
  BROWSE_CACHE_NAME,
  type BrowseCacheConfig,
  type BrowseTileEntry,
  browseCacheActive,
  browseCacheDefaults,
  putTileResponse,
  readBrowseCacheState,
  readBrowseIndex,
  tileTemplateToRegExp,
  writeBrowseCacheStats,
  writeBrowseIndex,
} from '@features/cachedMaps/browseCache.js';
import { fetchTile } from './fetchTile.js';

// how soon the settings and the layer templates may be re-read
const RELOAD_MS = 5000;

// how long an image waits for a worker that hasn't read its settings yet
const READY_TIMEOUT_MS = 1500;

// index writes are batched this long, so a pan doesn't open a transaction per tile
const FLUSH_MS = 500;

// how stale a tile's LRU stamp may get before a hit rewrites it; without this
// every tile served would be a database write
const TOUCH_MS = 3600_000;

// eviction goes this far below the cap, so it doesn't run again on the next tile
const EVICT_RATIO = 0.9;

const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

let config: BrowseCacheConfig | null = null;

let matchers: RegExp[] = [];

let readAt = 0;

let loading: Promise<void> | null = null;

// the clear counter as of the last read; `null` before the first one
let clearedSeen: number | null = null;

function loadState(): Promise<void> {
  const started = readState().finally(() => {
    // a newer read may have taken over in the meantime
    if (loading === started) {
      loading = null;
    }

    readAt = Date.now();
  });

  loading = started;

  return started;
}

async function readState(): Promise<void> {
  try {
    const state = await readBrowseCacheState();

    // The app's `browse-cache-cleared` message can be lost — a worker that was
    // starting, or replaced. This counter is what makes the clear stick: without
    // it the next flush would write the emptied tiles back onto the books.
    if (clearedSeen !== null && state.cleared !== clearedSeen) {
      dropIndex();
    }

    clearedSeen = state.cleared;

    config = state.config;

    matchers = state.templates.flatMap((template) => {
      try {
        return [tileTemplateToRegExp(template)];
      } catch {
        return [];
      }
    });
  } catch {
    // IndexedDB unavailable. Settle on the defaults, which leave the cache
    // switched off, rather than keeping every image waiting on a read that isn't
    // coming.
    config ??= browseCacheDefaults;
  }
}

/**
 * Re-reads the settings and applies them at once. The retention settings can
 * have tightened, so a flush follows — but only where the cache is on at all, a
 * flush being what opens the index database.
 */
export async function applyBrowseState(): Promise<void> {
  await loadState();

  if (config && browseCacheActive(config)) {
    await scheduleFlush();
  }
}

/**
 * Re-reads the settings in the background. The fetch handler has to decide
 * synchronously whether to answer a request, so it goes by whatever the last
 * read produced.
 */
export function refreshBrowseState(): void {
  if (loading || Date.now() - readAt < RELOAD_MS) {
    return;
  }

  void loadState();
}

// Started at boot, so the read overlaps the worker starting up rather than
// sitting in front of the first screenful of tiles.
void loadState();

/** The settings under which this URL is ours to answer, if it is. */
function configFor(url: string): BrowseCacheConfig | undefined {
  return config &&
    browseCacheActive(config) &&
    matchers.some((re) => re.test(url))
    ? config
    : undefined;
}

/**
 * The response for a tile this cache owns, or `undefined` to leave the request
 * alone. A worker that has just started hasn't read its settings yet and no
 * fetch handler can wait for IndexedDB synchronously, so an image asked for in
 * that window is held rather than let through: in `cache-only` mode letting it
 * through is an error tile, and Leaflet never asks for that tile again.
 */
export function browseTileResponse(
  event: FetchEvent,
  mayWait: boolean,
): Promise<Response> | undefined {
  if (config === null) {
    return mayWait ? serveWhenReady(event) : undefined;
  }

  const settings = configFor(event.request.url);

  return settings && serveBrowseTile(event, settings);
}

async function serveWhenReady(event: FetchEvent): Promise<Response> {
  // Bounded: IndexedDB can be blocked outright — another tab mid-upgrade — and
  // an unbounded wait here would hang the image rather than merely leave it
  // uncached. Any real read beats this by orders of magnitude.
  await Promise.race([
    loading ?? loadState(),
    new Promise((resolve) => setTimeout(resolve, READY_TIMEOUT_MS)),
  ]);

  // Given up on once, not once per image: a database that never answers leaves
  // the read pending for good, and every image after this one would race that
  // same dead promise against a timer of its own. The read still wins if it ever
  // lands.
  config ??= browseCacheDefaults;

  const settings = configFor(event.request.url);

  return settings ? serveBrowseTile(event, settings) : fetch(event.request);
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

/** The tiles held, what they cost, and which of them the database hasn't seen. */
type BrowseIndex = {
  entries: Map<string, BrowseTileEntry>;
  bytes: number;
  dirty: Set<string>;
};

let index: Promise<BrowseIndex> | null = null;

let flush: Promise<void> | null = null;

let flushing: Promise<void> = Promise.resolve();

// set by a store that ran out of room; makes the next flush free space whatever
// the configured cap allows
let trim = false;

let cache: Promise<Cache> | null = null;

// whether there is a cache to look in at all — off by default, so usually not
let exists: Promise<boolean> | null = null;

function openCache(): Promise<Cache> {
  cache ??= caches.open(BROWSE_CACHE_NAME);

  // opening creates it
  exists = Promise.resolve(true);

  return cache;
}

function cacheExists(): Promise<boolean> {
  exists ??= caches.has(BROWSE_CACHE_NAME).catch(() => false);

  return exists;
}

function loadIndex(): Promise<BrowseIndex> {
  index ??= readBrowseIndex()
    .catch(() => new Map<string, BrowseTileEntry>())
    .then((entries) => {
      let bytes = 0;

      for (const entry of entries.values()) {
        bytes += entry.size;
      }

      return { entries, bytes, dirty: new Set<string>() };
    });

  return index;
}

/**
 * Forgets the index and the cache handle, whatever they said. The tiles are
 * gone: either the app has just emptied the cache, or it did so while this
 * worker was asleep — and a handle to a deleted cache accepts writes that go
 * nowhere.
 */
export function dropIndex(): void {
  index = null;

  cache = null;

  exists = null;

  trim = false;

  // The clear counter behind this is whatever the next read finds: comparing
  // against what was seen before would drop the index a second time, losing the
  // entries of tiles cached in between.
  clearedSeen = null;
}

function scheduleFlush(): Promise<void> {
  flush ??= new Promise<void>((resolve) => {
    setTimeout(resolve, FLUSH_MS);
  }).then(() => {
    flush = null;

    // One pass at a time: two overlapping ones would each evict against the same
    // byte total and together take the cache far below its cap.
    flushing = flushing.catch(() => {}).then(flushIndex);

    return flushing;
  });

  return flush;
}

/** The tiles too old to keep, where age is allowed to evict at all. */
function expiredUrls(
  held: BrowseIndex,
  settings: BrowseCacheConfig,
  now: number,
): string[] {
  const maxAgeMs = settings.maxAgeDays * DAY_MS;

  // Age evicts only where an expired tile can be fetched again. `cache-only`
  // serves an expired tile rather than nothing, and so does every mode with no
  // connection — dropping it there takes away the only copy there is.
  if (!maxAgeMs || settings.mode === 'cache-only' || !navigator.onLine) {
    return [];
  }

  return [...held.entries]
    .filter(([, entry]) => now - entry.fetchedAt > maxAgeMs)
    .map(([url]) => url);
}

/**
 * Writes the pending index changes, then drops what the retention settings no
 * longer allow — expired tiles first, then the least recently served ones until
 * the cache is back under its cap.
 */
async function flushIndex(): Promise<void> {
  // The promise `held` came from: `dropIndex` clears it and a later load makes a
  // new one, so comparing it is how a pass notices that its tiles are gone.
  const source = loadIndex();

  const held = await source;

  // Every path that touches the index has waited for the settings first, so
  // there are always some to evict against by the time a flush runs.
  const settings = config ?? browseCacheDefaults;

  const drop = new Set(expiredUrls(held, settings, Date.now()));

  // What the drops free, rather than what the cache is left holding: tiles
  // stored while this pass awaits add to `bytes`, and writing back a total taken
  // before them would lose their size and let the cache overrun its cap.
  let freed = 0;

  for (const url of drop) {
    freed += held.entries.get(url)?.size ?? 0;
  }

  const maxBytes = settings.maxSizeMb * 1024 * 1024;

  // A store that failed for want of room trims whatever the cap says: the
  // browser's own quota is the real ceiling, and only making space clears it.
  const target = trim
    ? held.bytes * EVICT_RATIO
    : maxBytes && held.bytes - freed > maxBytes
      ? maxBytes * EVICT_RATIO
      : 0;

  trim = false;

  if (target) {
    const lru = [...held.entries]
      .filter(([url]) => !drop.has(url))
      .sort((a, b) => a[1].at - b[1].at);

    for (const [url, entry] of lru) {
      if (held.bytes - freed <= target) {
        break;
      }

      drop.add(url);

      freed += entry.size;
    }
  }

  const updated: [string, BrowseTileEntry][] = [];

  for (const url of held.dirty) {
    const entry = held.entries.get(url);

    if (entry && !drop.has(url)) {
      updated.push([url, entry]);
    }
  }

  // the cache was emptied under this pass; its tiles are not ours to write back
  if (index !== source) {
    return;
  }

  for (const url of drop) {
    held.dirty.delete(url);
  }

  if (drop.size > 0) {
    const opened = await openCache();

    await Promise.all(
      [...drop].map((url) => {
        held.entries.delete(url);

        return opened.delete(url);
      }),
    );
  }

  held.bytes -= freed;

  await writeBrowseIndex(updated, [...drop]);

  // Dropped only once written, and only where the entry is still the one that
  // was written: a failed write leaves them pending, and one replaced meanwhile
  // has a newer size to persist.
  for (const [url, entry] of updated) {
    if (held.entries.get(url) === entry) {
      held.dirty.delete(url);
    }
  }

  await writeBrowseCacheStats({ tiles: held.entries.size, bytes: held.bytes });
}

/**
 * Records what a tile costs, by the difference from what it was recorded at
 * before. An adoption and a store can land for the same tile in either order —
 * a stale `cache-first` hit does both — and counting the difference is what
 * keeps the total right whichever gets there first.
 */
function setEntry(
  held: BrowseIndex,
  url: string,
  size: number,
  now: number,
): void {
  held.bytes += size - (held.entries.get(url)?.size ?? 0);

  held.entries.set(url, { size, at: now, fetchedAt: now });

  held.dirty.add(url);
}

/** Moves a served tile to the head of the LRU, sparingly (see TOUCH_MS). */
function touchTile(
  event: FetchEvent,
  held: BrowseIndex,
  url: string,
  served: Response,
): void {
  const now = Date.now();

  const entry = held.entries.get(url);

  if (entry) {
    if (now - entry.at < TOUCH_MS) {
      return;
    }

    held.entries.set(url, { ...entry, at: now });

    held.dirty.add(url);

    event.waitUntil(scheduleFlush());

    return;
  }

  // A tile in the cache with no index entry is drift — a cache the browser
  // trimmed, or an interrupted flush. Cloned here rather than in the adoption
  // itself: by the time that runs the body is on its way to the `<img>`, and a
  // response whose body has been read can't be cloned any more.
  event.waitUntil(adoptTile(held, url, served.clone(), now));
}

/**
 * Takes a tile the index had lost back onto the books, measured so the size cap
 * counts what it holds, and dated from now — its real age is unknown, and dating
 * it earlier would have the next flush delete a tile the user is looking at.
 */
async function adoptTile(
  held: BrowseIndex,
  url: string,
  served: Response,
  now: number,
): Promise<void> {
  setEntry(held, url, (await served.blob()).size, now);

  await scheduleFlush();
}

async function putTile(
  held: BrowseIndex,
  url: string,
  response: Response,
): Promise<void> {
  const blob = await response.blob();

  try {
    await putTileResponse(
      await openCache(),
      url,
      response.headers.get('content-type'),
      blob,
    );
  } catch {
    // Out of quota, most likely. Nothing was stored, so the index needs no
    // correction — but without room the next tile fails the same way, so ask for
    // a trim.
    trim = true;

    await scheduleFlush();

    return;
  }

  setEntry(held, url, blob.size, Date.now());

  await scheduleFlush();
}

/**
 * Refreshes a stale tile that has already been served from the cache, so a
 * revalidation that hangs costs nothing on screen.
 */
async function revalidateTile(
  event: FetchEvent,
  held: BrowseIndex,
  url: string,
): Promise<void> {
  try {
    const response = await fetch(event.request);

    if (response.ok) {
      await putTile(held, url, response);
    }
  } catch {
    // still unreachable; the stale tile stands and the next view tries again
  }
}

/**
 * A tile held under any of `urls` — the spellings one tile could have been
 * stored under — for an offline map that lacks it. Served whatever the mode
 * says: the mode governs browsing, and here the alternative is a blank tile.
 */
export async function browseCachedTile(
  event: FetchEvent,
  urls: string[],
): Promise<Response | undefined> {
  if (!(await cacheExists())) {
    return undefined;
  }

  const held = await loadIndex();

  // The index says which spelling is held, so only one is fetched. Falling back
  // on the address actually asked for, since the two can drift apart.
  const url = urls.find((candidate) => held.entries.has(candidate)) ?? urls[0];

  let stored: Response | undefined;

  try {
    // by name, not `openCache`: nothing here should create the cache
    stored = await caches.match(url, {
      cacheName: BROWSE_CACHE_NAME,
      ignoreVary: true,
    });
  } catch {
    return undefined;
  }

  // A touch schedules a flush, which evicts by the settings — so before they are
  // read the tile is served untouched rather than judged by someone else's.
  if (stored && config) {
    touchTile(event, held, url, stored);
  }

  return stored;
}

async function serveBrowseTile(
  event: FetchEvent,
  settings: BrowseCacheConfig,
): Promise<Response> {
  const { url } = event.request;

  let held: BrowseIndex;

  let stored: Response | undefined;

  try {
    [held, stored] = await Promise.all([
      loadIndex(),
      openCache().then((opened) => opened.match(url, { ignoreVary: true })),
    ]);
  } catch {
    // Cache Storage is unavailable, so there is nothing to serve or to write.
    // The connection is a different matter, and every mode but one may use it.
    return settings.mode === 'cache-only'
      ? new Response(null, { status: 404 })
      : fetch(event.request);
  }

  // `network-only` never answers from the cache — the copy is looked up only so
  // a tile already held isn't stored a second time.
  const cached = settings.mode === 'network-only' ? undefined : stored;

  const maxAgeMs = settings.maxAgeDays * DAY_MS;

  const entry = held.entries.get(url);

  // Measured from the fetch, not from `at` — that moves every time the tile is
  // served, which would keep a regularly viewed area from ever being refreshed.
  // A cached tile the index has lost counts as expired, so it is fetched again
  // and its size properly recorded.
  const expired =
    Boolean(maxAgeMs) && (!entry || Date.now() - entry.fetchedAt > maxAgeMs);

  // A tile in hand is what these two modes are for, expired or not: this one is
  // served now, and `cache-first` refreshes a stale one behind it rather than
  // making the map wait on a connection that may never answer.
  if (
    cached &&
    (settings.mode === 'cache-only' || settings.mode === 'cache-first')
  ) {
    touchTile(event, held, url, cached);

    if (settings.mode === 'cache-first' && expired && settings.store) {
      event.waitUntil(revalidateTile(event, held, url));
    }

    return cached;
  }

  if (settings.mode === 'cache-only') {
    return new Response(null, { status: 404 });
  }

  try {
    // The request as the tile <img> made it, so its mode and its referrer reach
    // the server exactly as they would without a service worker in the way. A
    // copy in hand is better than a retry's delay, so only a tile with nothing
    // to fall back on waits for a second attempt.
    const response = await (cached
      ? fetch(event.request)
      : fetchTile(event.request));

    // A server error is no better than no answer at all when there is a tile to
    // show. Opaque (non-CORS) responses report status 0 and are not errors —
    // they are simply bodies we can't read.
    if (cached && !response.ok && response.type !== 'opaque') {
      touchTile(event, held, url, cached);

      return cached;
    }

    // `ok` is false for an opaque (non-CORS) response, whose size can't be read
    // and which the browser pads heavily against the storage quota — those
    // layers pass through uncached.
    if (settings.store && response.ok && (!stored || expired)) {
      event.waitUntil(putTile(held, url, response.clone()));
    } else if (cached) {
      // network-first keeps its copy without rewriting it; it is being looked at,
      // so it should outlive the tiles that aren't
      touchTile(event, held, url, cached);
    }

    return response;
  } catch (err) {
    if (cached) {
      touchTile(event, held, url, cached);

      return cached;
    }

    throw err;
  }
}
