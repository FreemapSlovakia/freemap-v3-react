import {
  clear,
  createStore,
  entries,
  get,
  getMany,
  set,
  type UseStore,
} from 'idb-keyval';

/**
 * The tile cache that ordinary map browsing fills, and the settings the service
 * worker drives it from. Shared with `src/sw/sw.ts`, so nothing here may reach
 * for the DOM or the Redux store.
 */

/** Tiles picked up while browsing, kept apart from the per-map `tiles-<id>` caches. */
export const BROWSE_CACHE_NAME = 'tiles-browse';

// keys in the default idb-keyval store, which is what the service worker reads
const CONFIG_KEY = 'browseTileCacheConfig';

const TEMPLATES_KEY = 'browseTileCacheTemplates';

const STATS_KEY = 'browseTileCacheStats';

const CLEARED_KEY = 'browseTileCacheCleared';

export type TileServeMode =
  | 'network-only'
  | 'network-first'
  | 'cache-first'
  | 'cache-only';

export type BrowseCacheConfig = {
  mode: TileServeMode;
  /** Whether a tile fetched from the network is written to the cache. */
  store: boolean;
  /** Days a tile stays usable; 0 keeps it until the size cap evicts it. */
  maxAgeDays: number;
  /** Ceiling in MB, past which the least recently served tiles go; 0 is no cap. */
  maxSizeMb: number;
};

export const browseCacheDefaults: BrowseCacheConfig = {
  mode: 'network-only',
  store: false,
  maxAgeDays: 30,
  maxSizeMb: 500,
};

export type BrowseCacheStats = { tiles: number; bytes: number };

export type BrowseTileEntry = {
  size: number;
  /** When the tile was last served — the LRU key. */
  at: number;
  /** When the tile came off the network — what its age is measured from. */
  fetchedAt: number;
};

/**
 * Whether the settings give the service worker anything to do. When they don't
 * it leaves tile requests alone entirely rather than passing them through.
 */
export function browseCacheActive(config: BrowseCacheConfig): boolean {
  return config.mode !== 'network-only' || config.store;
}

let indexStore: UseStore | undefined;

// opened on first use: a session that never turns the cache on shouldn't pay
// for the database connection
function getIndexStore(): UseStore {
  indexStore ??= createStore('fm-browse-tiles', 'entries');

  return indexStore;
}

/**
 * Everything the service worker drives the cache from, in one transaction — it
 * re-reads all of it together, on a schedule.
 */
export async function readBrowseCacheState(): Promise<{
  config: BrowseCacheConfig;
  templates: string[];
  cleared: number;
}> {
  // `getMany` types every key the same, so the tuple is named here instead
  const [config, templates, cleared] = (await getMany([
    CONFIG_KEY,
    TEMPLATES_KEY,
    CLEARED_KEY,
  ])) as [
    Partial<BrowseCacheConfig> | undefined,
    string[] | undefined,
    number | undefined,
  ];

  return {
    config: { ...browseCacheDefaults, ...config },
    templates: templates ?? [],
    cleared: cleared ?? 0,
  };
}

export async function writeBrowseCacheConfig(
  config: BrowseCacheConfig,
): Promise<void> {
  await set(CONFIG_KEY, config);
}

export async function writeBrowseTileTemplates(
  templates: string[],
): Promise<void> {
  await set(TEMPLATES_KEY, templates);
}

export async function readBrowseCacheStats(): Promise<BrowseCacheStats> {
  return (await get<BrowseCacheStats>(STATS_KEY)) ?? { tiles: 0, bytes: 0 };
}

export async function writeBrowseCacheStats(
  stats: BrowseCacheStats,
): Promise<void> {
  await set(STATS_KEY, stats);
}

export async function readBrowseIndex(): Promise<Map<string, BrowseTileEntry>> {
  return new Map(await entries<string, BrowseTileEntry>(getIndexStore()));
}

export async function writeBrowseIndex(
  updated: [string, BrowseTileEntry][],
  removed: string[],
): Promise<void> {
  if (removed.length === 0 && updated.length === 0) {
    return;
  }

  await getIndexStore()('readwrite', (store) => {
    for (const url of removed) {
      store.delete(url);
    }

    for (const [url, entry] of updated) {
      store.put(entry, url);
    }
  });
}

export async function clearBrowseCache(): Promise<void> {
  await caches.delete(BROWSE_CACHE_NAME);

  await clear(getIndexStore());

  // The worker holds the index in memory and the message telling it to let go
  // can be lost; this counter, compared across its reads, is what makes a clear
  // stick regardless.
  await set(CLEARED_KEY, ((await get<number>(CLEARED_KEY)) ?? 0) + 1);

  await writeBrowseCacheStats({ tiles: 0, bytes: 0 });
}

/**
 * Stores a tile under `key`, stripped to its body and content type. The source
 * server's CORS headers and `Vary` mean nothing under a cache key of our own and
 * only make `cache.match` browser-dependent.
 */
export async function putTileResponse(
  cache: Cache,
  key: string,
  contentType: string | null,
  body: Blob,
): Promise<void> {
  await cache.put(
    key,
    new Response(body, {
      headers: { 'Content-Type': contentType ?? 'application/octet-stream' },
    }),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches every tile URL a layer template can produce, `@Nx` variants included.
 * The service worker has nothing but the request URL to go on, so this is how it
 * tells a map tile from any other cross-origin request.
 */
export function tileTemplateToRegExp(template: string): RegExp {
  const body = template
    .split(/(\{[sxyz]\})/)
    .map((part) =>
      part === '{s}'
        ? '[^./]+'
        : part === '{x}' || part === '{y}'
          ? '-?\\d+'
          : part === '{z}'
            ? '\\d+'
            : escapeRegExp(part),
    )
    .join('');

  return new RegExp(
    // a protocol-relative template is fetched over whatever the page uses;
    // `@Nx` is the hi-DPI variant ScaledTileLayer appends to the URL
    `^${body.startsWith('//') ? `https?:${body}` : body}(?:@\\d+(?:\\.\\d+)?x)?(?:\\?.*)?$`,
  );
}
