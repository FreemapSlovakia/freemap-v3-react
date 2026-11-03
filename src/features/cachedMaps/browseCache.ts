import { ATTRIBUTION_HEADER } from '@shared/tileAttribution.js';
import { buildTileUrl, TILE_SCALE_SUFFIX } from '@shared/tileUrl.js';
import {
  clear,
  createStore,
  entries,
  get,
  getMany,
  set,
  setMany,
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

// the app's own: what each map's template was, for maps still loading
const TEMPLATES_BY_TYPE_KEY = 'browseTileCacheTemplatesByType';

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

/**
 * A tile layer's URL template, with what the worker needs to name the tiles
 * around one it was asked for: the hosts `{s}` cycles over, and which way `{y}`
 * runs.
 */
export type BrowseTileTemplate = {
  url: string;
  subdomains?: string | string[];
  tms?: boolean;
};

// a bare string is a template without subdomains or `tms`
function toTemplate(stored: BrowseTileTemplate | string): BrowseTileTemplate {
  return typeof stored === 'string' ? { url: stored } : stored;
}

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
  templates: BrowseTileTemplate[];
  cleared: number;
}> {
  // `getMany` types every key the same, so the tuple is named here instead
  const [config, templates, cleared] = (await getMany([
    CONFIG_KEY,
    TEMPLATES_KEY,
    CLEARED_KEY,
  ])) as [
    Partial<BrowseCacheConfig> | undefined,
    (BrowseTileTemplate | string)[] | undefined,
    number | undefined,
  ];

  return {
    config: { ...browseCacheDefaults, ...config },
    templates: (templates ?? []).map(toTemplate),
    cleared: cleared ?? 0,
  };
}

export async function writeBrowseCacheConfig(
  config: BrowseCacheConfig,
): Promise<void> {
  await set(CONFIG_KEY, config);
}

export async function writeBrowseTileTemplates(
  byType: Record<string, BrowseTileTemplate>,
): Promise<void> {
  const unique = new Map(
    Object.values(byType).map((template) => [
      JSON.stringify(template),
      template,
    ]),
  );

  await setMany([
    [TEMPLATES_KEY, [...unique.values()]],
    [TEMPLATES_BY_TYPE_KEY, byType],
  ]);
}

export async function readBrowseTileTemplatesByType(): Promise<
  Record<string, BrowseTileTemplate>
> {
  const stored =
    (await get<Record<string, BrowseTileTemplate | string>>(
      TEMPLATES_BY_TYPE_KEY,
    )) ?? {};

  return Object.fromEntries(
    Object.entries(stored).map(([type, t]) => [type, toTemplate(t)]),
  );
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
 * Stores a tile under `key`, stripped to its body, content type and the
 * datasets the source said it drew from — which a later pass reads back off the
 * stored response rather than fetching the tile again. The rest of the source
 * server's headers mean nothing under a cache key of our own, and its `Vary`
 * only makes `cache.match` browser-dependent.
 */
export async function putTileResponse(
  cache: Cache,
  key: string,
  contentType: string | null,
  body: Blob,
  attribution?: string | null,
): Promise<void> {
  await cache.put(
    key,
    new Response(body, {
      headers: {
        'Content-Type': contentType ?? 'application/octet-stream',
        // null is unknown and stays unsaid; empty credits nothing, and is kept
        ...(attribution !== null &&
          attribution !== undefined && {
            [ATTRIBUTION_HEADER]: attribution,
          }),
      },
    }),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PLACEHOLDER_PATTERNS: Record<string, string> = {
  s: '[^./]+',
  x: '-?\\d+',
  y: '-?\\d+',
  z: '\\d+',
};

/**
 * Matches every tile URL a layer template can produce, `@Nx` variants included,
 * so the service worker can tell a map tile from any other request. The
 * placeholders, `proto` and the `@Nx`/query `tail` are named groups.
 */
export function tileTemplateToRegExp(template: string): RegExp {
  const named = new Set<string>();

  const body = template
    .split(/(\{[sxyz]\})/)
    .map((part) => {
      const name = /^\{([sxyz])\}$/.exec(part)?.[1];

      if (!name) {
        return escapeRegExp(part);
      }

      if (named.has(name)) {
        return `\\k<${name}>`;
      }

      named.add(name);

      return `(?<${name}>${PLACEHOLDER_PATTERNS[name]})`;
    })
    .join('');

  return new RegExp(
    // a protocol-relative template is fetched over whatever the page uses
    `^${body.startsWith('//') ? `(?<proto>https?:)${body}` : body}(?<tail>(?:${TILE_SCALE_SUFFIX})?(?:\\?.*)?)$`,
  );
}

/** A layer's tile URLs, and what it takes to name a tile's ancestors. */
export type TileGrid = {
  template: string;
  re: RegExp;
  subdomains: string[];
  tms: boolean;
};

export type TileAncestor = {
  url: string;
  /** How many of the tile fit across the ancestor. */
  scale: number;
  /** Where in the ancestor the tile lies, counted from its top left. */
  col: number;
  row: number;
};

/**
 * The tiles that cover a tile's area at lower zooms, nearest first, each
 * under every host `{s}` cycles over — the tile's own host first. Empty for a
 * URL `re` doesn't match or a template that doesn't name `{z}`, `{x}` and `{y}`.
 */
export function tileAncestors(
  url: string,
  { template, re, subdomains, tms }: TileGrid,
  maxLevels: number,
): TileAncestor[] {
  const groups = re.exec(url)?.groups;

  const z = Number(groups?.['z']);

  const x = Number(groups?.['x']);

  const y = Number(groups?.['y']);

  if (!groups || Number.isNaN(z) || Number.isNaN(x) || Number.isNaN(y)) {
    return [];
  }

  const own = groups['s'];

  const hosts =
    own === undefined
      ? [undefined]
      : [own, ...subdomains.filter((host) => host !== own)];

  const ancestors: TileAncestor[] = [];

  for (let level = 1; level <= Math.min(maxLevels, z); level++) {
    const scale = 2 ** level;

    const ax = Math.floor(x / scale);

    const ay = Math.floor(y / scale);

    const rowInGrid = y - ay * scale;

    for (const s of hosts) {
      ancestors.push({
        url:
          (groups['proto'] ?? '') +
          buildTileUrl(template, ax, ay, z - level, s) +
          (groups['tail'] ?? ''),
        scale,
        col: x - ax * scale,
        // a TMS `{y}` counts up from the bottom
        row: tms ? scale - 1 - rowInGrid : rowInGrid,
      });
    }
  }

  return ancestors;
}
