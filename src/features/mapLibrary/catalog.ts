import {
  fetchOrNetworkError,
  HttpError,
  isNetworkError,
} from '@app/httpRequest.js';
import type { MapIndexEntry } from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';
import { mapIndex } from '@shared/mapLibrary/mapIndex.js';
import z from 'zod';

/** A map the library offers: a built-in one, or one from the catalog. */
export type CatalogEntry = {
  type: string;
  layer: 'base' | 'overlay';
  /** Its own name; a built-in map's is translated instead. */
  name?: string;
  countries?: string[];
  category?: string;
} & (
  | { index: MapIndexEntry; map?: never }
  | { map: CatalogMap; index?: never }
);

/** An entry's technology; the catalog's data leaves out a tile map's. */
export const technologyOf = (entry: CatalogEntry): string =>
  entry.index?.technology ?? entry.map?.technology ?? 'tile';

// Checked per map at the boundary, what the map slice and the registry rely
// on: one the app can't take is left out rather than failing the rest.
const CatalogMapSchema = z
  .looseObject({
    type: z.string().refine(isCatalogId),
    layer: z.enum(['base', 'overlay']),
    name: z.string(),
    technology: z.enum(['tile', 'wms']).optional(),
    body: z.looseObject({
      url: z.string(),
      layers: z.array(z.string()).optional(),
      proxy: z.boolean().optional(),
      // Read by the credits.
      attribution: z.array(z.looseObject({})),
    }),
  })
  // The map and feature-info code read a WMS's layers.
  .refine((map) => map.technology !== 'wms' || map.body.layers !== undefined);

const isCatalogMap = (map: unknown): map is CatalogMap =>
  CatalogMapSchema.safeParse(map).success;

/** Something other than the API answered (a captive portal's page), or it stalled. */
class UnreachableError extends Error {}

// To the first byte, and in all: a stalled connection is given up on, while a
// slow line still gets the whole catalog.
const FIRST_BYTE_TIMEOUT = 15_000;

const TOTAL_TIMEOUT = 120_000;

// The most ids `GET /map-catalog?types=` takes (its `MAX_TYPES`).
const TYPES_PER_REQUEST = 100;

/** The API's catalog (`GET /map-catalog`): all maps, or those of `types`. */
async function fetchCatalogMaps(
  types?: readonly string[],
): Promise<CatalogMap[]> {
  const ac = new AbortController();

  // Ours rather than the abort's reason: engines differ in what they reject with.
  let timedOut = false;

  const abortAfter = (ms: number) =>
    setTimeout(() => {
      timedOut = true;

      ac.abort();
    }, ms);

  const firstByte = abortAfter(FIRST_BYTE_TIMEOUT);

  const total = abortAfter(TOTAL_TIMEOUT);

  try {
    const res = await fetchOrNetworkError(
      new Request(
        `${process.env['API_URL']}/map-catalog${types ? `?types=${encodeURIComponent(types.join(','))}` : ''}`,
        { signal: ac.signal },
      ),
    );

    clearTimeout(firstByte);

    if (!res.ok) {
      // The body, shortened: an error page can be long.
      throw new HttpError(res.status, (await res.text()).slice(0, 200));
    }

    let body;

    // A page that isn't JSON is someone else's (a captive portal); malformed
    // JSON is the API's own error, to be shown.
    const json = /\bjson\b/i.test(res.headers.get('Content-Type') ?? '');

    try {
      body = await res.json();
    } catch (err) {
      throw timedOut || json
        ? err
        : new UnreachableError('map catalog: not JSON', { cause: err });
    }

    const maps = z.object({ maps: z.array(z.unknown()) }).parse(body).maps;

    const kept = maps.filter(isCatalogMap);

    if (kept.length < maps.length) {
      console.warn(
        `Map catalog: ${maps.length - kept.length} maps the app can't take left out`,
      );
    }

    return kept;
  } catch (err) {
    throw timedOut
      ? new UnreachableError('map catalog: timed out', { cause: err })
      : err;
  } finally {
    clearTimeout(firstByte);

    clearTimeout(total);
  }
}

/**
 * The API out of reach, not answering wrongly: offline, timed out, nginx saying
 * the API itself is away, or another page answering. Not worth a toast for an
 * installed map, a third party's online service that can't draw offline anyway.
 */
export const isUnreachable = (err: unknown) =>
  isNetworkError(err) ||
  err instanceof UnreachableError ||
  // nginx with the API away or limiting the rate, an API without the route
  // yet (deployed after the app), or a proxy or captive portal on the way.
  (err instanceof HttpError &&
    [404, 407, 408, 429, 502, 503, 504, 511].includes(err.status));

let catalog: Promise<CatalogEntry[]> | undefined;

// Set once the whole catalog has arrived; until then a lookup by id doesn't
// wait for the larger download.
let loadedCatalog: CatalogEntry[] | undefined;

const entriesOf = (maps: readonly CatalogMap[]): CatalogEntry[] => [
  ...mapIndex.map(
    (index): CatalogEntry => ({
      type: index.type,
      layer: index.layer,
      countries: index.countries,
      category: index.category,
      index,
    }),
  ),
  ...maps.map((map): CatalogEntry => ({ ...map, map })),
];

/**
 * Loaded on first use, as at thousands of maps it is no part of the start. A
 * failure is the library's error to show, and asked again on the next call.
 */
export function loadLibraryCatalog(): Promise<CatalogEntry[]> {
  catalog ??= fetchCatalogMaps()
    .then((maps) => {
      loadedCatalog = entriesOf(maps);

      return loadedCatalog;
    })
    .catch((err: unknown) => {
      catalog = undefined;

      throw err;
    });

  return catalog;
}

/** The catalog maps of these ids; an id the catalog lacks is left out. */
export async function loadCatalogMaps(
  types: readonly string[],
): Promise<CatalogMap[]> {
  // From the whole catalog when it's here; the ones it lacks (added to the API
  // since it loaded) are asked like the rest, in batches the API takes.
  const known = new Map(
    (loadedCatalog ?? []).flatMap((entry) =>
      entry.map ? [[entry.type, entry.map] as const] : [],
    ),
  );

  const found = types.flatMap((type) => known.get(type) ?? []);

  const asked = types.filter((type) => !known.has(type));

  const batches = [];

  for (let i = 0; i < asked.length; i += TYPES_PER_REQUEST) {
    batches.push(fetchCatalogMaps(asked.slice(i, i + TYPES_PER_REQUEST)));
  }

  return [...found, ...(await Promise.all(batches)).flat()];
}
