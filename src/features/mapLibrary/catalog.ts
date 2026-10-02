import type { MapIndexEntry } from '@shared/mapDefinitions.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';
import { mapIndex } from '@shared/mapLibrary/mapIndex.js';

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

const dev = !process.env['DEPLOYMENT'] || process.env['DEPLOYMENT'] === 'dev';

let catalog: Promise<CatalogEntry[]> | undefined;

/** Loaded on first use, as at thousands of maps it is no part of the start. */
export function loadLibraryCatalog(): Promise<CatalogEntry[]> {
  catalog ??= (async () => {
    const builtIn = mapIndex.map(
      (index): CatalogEntry => ({
        type: index.type,
        layer: index.layer,
        countries: index.countries,
        index,
      }),
    );

    // Placeholders that exercise search and install at the catalog's scale.
    const maps: CatalogMap[] = dev
      ? (await import('./devCatalog.js')).devCatalog()
      : [];

    return [...builtIn, ...maps.map((map): CatalogEntry => ({ ...map, map }))];
  })();

  return catalog;
}

/** The catalog maps of these ids; an id the catalog lacks is left out. */
export async function loadCatalogMaps(
  types: readonly string[],
): Promise<CatalogMap[]> {
  const wanted = new Set(types);

  return (await loadLibraryCatalog()).flatMap((entry) =>
    entry.map && wanted.has(entry.type) ? [entry.map] : [],
  );
}
