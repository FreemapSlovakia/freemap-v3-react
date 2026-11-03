import { useMessages } from '@features/l10n/l10nInjector.js';
import { regionName, useRegionNames } from '@shared/hooks/useRegionNames.js';
import { layerName } from '@shared/layerName.js';
import { useMemo } from 'react';
import type { Messages } from '@/translations/messagesInterface.js';
import type { CatalogEntry } from './catalog.js';
import { prepareSearchTarget, type SearchTarget } from './librarySearch.js';

/** What a map is found by besides its name: keywords, countries, category. */
export const searchExtras = (
  m: Messages | undefined,
  regionNames: Intl.DisplayNames,
  map: { type: string; countries?: readonly string[]; category?: string },
): string[] => [
  ...(m?.search.commands.keywords[`layer-${map.type}`]?.split(',') ?? []),
  ...(map.countries ?? []).flatMap((country) => [
    country,
    regionName(regionNames, country),
  ]),
  map.category ?? '',
];

export type PreparedEntry = { name: string; target: SearchTarget };

type Prepared = ReadonlyMap<string, PreparedEntry>;

// Shared by the map menu and the manager, which get the same catalog array.
const cache = new WeakMap<
  readonly CatalogEntry[],
  {
    m: Messages | undefined;
    regionNames: Intl.DisplayNames;
    prepared: Prepared;
  }
>();

const empty: Prepared = new Map();

/** Each entry's name and search target, per catalog and language. */
export function usePreparedCatalog(
  catalog: readonly CatalogEntry[] | undefined,
): Prepared {
  const m = useMessages();

  const regionNames = useRegionNames();

  return useMemo(() => {
    if (!catalog) {
      return empty;
    }

    const hit = cache.get(catalog);

    if (hit && hit.m === m && hit.regionNames === regionNames) {
      return hit.prepared;
    }

    const prepared = new Map(
      catalog.map((entry) => {
        const name = layerName(entry, m) ?? entry.type;

        return [
          entry.type,
          {
            name,
            target: prepareSearchTarget(
              name,
              searchExtras(m, regionNames, entry),
            ),
          },
        ];
      }),
    );

    cache.set(catalog, { m, regionNames, prepared });

    return prepared;
  }, [catalog, m, regionNames]);
}
