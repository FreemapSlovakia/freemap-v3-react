import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo, useState } from 'react';
import { builtInEntries, type CatalogEntry } from './catalog.js';
import { coversView } from './filters.js';
import { searchAll } from './librarySearch.js';
import {
  drawnTypesSelector,
  integratedLayerDefsSelector,
} from './model/selectors.js';
import { usePreparedCatalog } from './searchTargets.js';
import {
  useCanSee,
  useIsInstalled,
  useLibraryCatalog,
} from './useLibraryCatalog.js';

/**
 * `on`: drawn, `installed`: just installed, though the menu doesn't list it yet
 * (its body is loading).
 */
type AvailableMatch = {
  entry: CatalogEntry;
  name: string;
  on: boolean;
  installed: boolean;
};

/**
 * The maps not listed by the map menu that match `query`, those drawing in the
 * view first, at most `limit`; with how many matched in all. The catalog loads
 * on the first query, the built-in maps are searched meanwhile.
 */
export function useAvailableMatches(
  query: string,
  limit: number,
): { matches: AvailableMatch[]; total: number } {
  const active = query.trim() !== '';

  // Once asked, kept: an emptied filter mustn't cost preparing it all again.
  const [wanted, setWanted] = useState(false);

  // The built-in maps are still found if it fails; the manager shows why.
  const { catalog, error } = useLibraryCatalog(wanted);

  if (active && !wanted) {
    setWanted(true);
  } else if (!active && wanted && error !== undefined) {
    // So the next search asks again.
    setWanted(false);
  }

  const entries = catalog ?? builtInEntries;

  const prepared = usePreparedCatalog(wanted ? entries : undefined);

  const isInstalled = useIsInstalled();

  const canSee = useCanSee();

  const drawn = useAppSelector(drawnTypesSelector);

  const listedDefs = useAppSelector(integratedLayerDefsSelector);

  // Only while searching, or every pan would redo it.
  const bounds = useAppSelector((state) =>
    active ? state.map.bounds : undefined,
  );

  const countries = useAppSelector((state) =>
    active ? state.map.countries : undefined,
  );

  // Apart from the query, so a keystroke only searches.
  const items = useMemo(() => {
    if (!active) {
      return [];
    }

    // Installed or switched on here, a map stays here until the menu lists it.
    const listed = new Set(listedDefs.map((def) => def.type));

    return entries.flatMap((entry) => {
      const prep = prepared.get(entry.type);

      return prep && !listed.has(entry.type) && canSee(entry)
        ? [{ entry, name: prep.name, target: prep.target }]
        : [];
    });
  }, [active, entries, prepared, canSee, listedDefs]);

  // Apart from the view, which only orders the matches.
  const matches = useMemo(
    () => (active ? searchAll(items, ({ target }) => target, query) : []),
    [active, items, query],
  );

  return useMemo(() => {
    const view = { bounds, countries };

    const ranked = Object.groupBy(matches, ({ entry }) =>
      coversView(entry, view) ? 'here' : 'elsewhere',
    );

    const all = [...(ranked.here ?? []), ...(ranked.elsewhere ?? [])];

    return {
      matches: all.slice(0, limit).map(({ entry, name }) => ({
        entry,
        name,
        on: drawn.includes(entry.type),
        installed: isInstalled(entry.type),
      })),
      total: all.length,
    };
  }, [matches, bounds, countries, limit, drawn, isInstalled]);
}
