import { Text } from '@features/l10n/Text.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { LayerKindMark } from '@shared/components/MapLayerItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { flaggedCountries } from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { catalogIcon } from '@shared/mapLibrary/catalogMap.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { type ReactElement, useEffect, useMemo } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { type CatalogEntry, technologyOf } from '../catalog.js';
import { installEntry, makeKnown } from '../catalogActions.js';
import {
  availableWanted,
  categoryGroup,
  coversView,
  type ManagerFilters,
  passes,
  technologyGroup,
} from '../filters.js';
import { searchAll } from '../librarySearch.js';
import { mapLibraryPreviewStart } from '../model/actions.js';
import type { PreparedEntry } from '../searchTargets.js';
import { useIsAvailable, useLibraryCatalog } from '../useLibraryCatalog.js';
import { MapDetail, passesCountry, useMapDetail } from './FilterChips.js';
import { MapNameLine } from './MapNameLine.js';

/** Rows added each time the list is scrolled to its end. */
const pageSize = 50;

/** The catalog, once loaded, what of it can be added, and whether it failed. */
export function useLibraryEntries(): {
  catalog: CatalogEntry[] | undefined;
  entries: CatalogEntry[];
  failed: boolean;
} {
  const dispatch = useDispatch();

  const { catalog, error } = useLibraryCatalog();

  useEffect(() => {
    if (error !== undefined) {
      dispatch(
        toastsAdd({
          id: 'mapLibrary.catalogError',
          messageKey: 'general.loadError',
          messageParams: { err: error },
          style: 'danger',
        }),
      );
    }
  }, [dispatch, error]);

  const isAvailable = useIsAvailable();

  const entries = useMemo(
    () => catalog?.filter(isAvailable) ?? [],
    [catalog, isAvailable],
  );

  return { catalog, entries, failed: error !== undefined };
}

/**
 * The available maps that pass the filters: a search best match first;
 * browsing, the maps that draw here first, then base maps before overlays,
 * each part by name.
 */
export function useLibraryRanked(
  entries: readonly CatalogEntry[],
  prepared: ReadonlyMap<string, PreparedEntry>,
  filters: ManagerFilters,
): CatalogEntry[] {
  const language = useAppSelector((state) => state.l10n.language);

  const { query } = filters;

  // Only when it decides something: covering filters it, browsing sorts by it.
  const needsView = filters.coversView || !query.trim();

  const viewBounds = useAppSelector((state) =>
    needsView ? state.map.bounds : undefined,
  );

  const viewCountries = useAppSelector((state) =>
    needsView ? state.map.countries : undefined,
  );

  return useMemo(() => {
    if (!availableWanted(filters)) {
      return [];
    }

    const view = { bounds: viewBounds, countries: viewCountries };

    const items = entries.flatMap((entry) => {
      const prep = prepared.get(entry.type);

      return prep &&
        passes(filters.layers, entry.layer) &&
        passes(
          filters.kinds,
          isCatalogId(entry.type) ? 'fromLibrary' : 'builtIn',
        ) &&
        passes(filters.categories, categoryGroup(entry.category)) &&
        passes(filters.technologies, technologyGroup(technologyOf(entry))) &&
        passesCountry(entry.countries, filters) &&
        (!filters.coversView || coversView(entry, view))
        ? [{ entry, ...prep }]
        : [];
    });

    if (filters.query.trim()) {
      return searchAll(items, ({ target }) => target, filters.query).map(
        ({ entry }) => entry,
      );
    }

    const byName = makeLabelComparator(language);

    const isBase = (entry: CatalogEntry) => Number(entry.layer === 'base');

    return items
      .map(({ entry, name }) => ({
        entry,
        name,
        here: coversView(entry, view),
      }))
      .sort(
        (a, b) =>
          Number(b.here) - Number(a.here) ||
          isBase(b.entry) - isBase(a.entry) ||
          byName(a.name, b.name),
      )
      .map(({ entry }) => entry);
  }, [entries, filters, prepared, viewBounds, viewCountries, language]);
}

type LibraryRowProps = {
  entry: CatalogEntry;
  name: string;
  canSave: boolean;
};

function LibraryRow({ entry, name, canSave }: LibraryRowProps): ReactElement {
  const msm = useMapSettingsMessages();

  const mapDetail = useMapDetail();

  const dispatch = useDispatch();

  const { type, index } = entry;

  return (
    <tr>
      <td>
        <LayerKindMark kind={entry.layer} />
      </td>

      <td>{index ? index.icon : catalogIcon(entry.map ?? entry)}</td>

      {/* No max width lets the name truncate instead of widening the table. */}
      <td className="w-100" style={{ maxWidth: 0 }}>
        <MapNameLine
          name={name}
          legacy={Boolean(index?.superseededBy)}
          countries={flaggedCountries(entry)}
        />

        <MapDetail parts={mapDetail(entry.category, technologyOf(entry))} />
      </td>

      <td>
        <LongPressTooltip label={msm?.preview}>
          {({ props }) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                makeKnown(dispatch, entry);

                dispatch(mapLibraryPreviewStart({ type }));
              }}
              {...props}
            >
              <FaEye />
            </Button>
          )}
        </LongPressTooltip>
      </td>

      <td>
        <LongPressTooltip label={msm?.install}>
          {({ props }) => (
            <Button
              size="sm"
              variant="secondary"
              disabled={!canSave}
              onClick={() => installEntry(dispatch, entry)}
              {...props}
            >
              <FaPlus />
            </Button>
          )}
        </LongPressTooltip>
      </td>
    </tr>
  );
}

type ResultsProps = {
  ranked: CatalogEntry[];
  nameOf: (entry: CatalogEntry) => string;
  canSave: boolean;
};

/** The ranked available maps, a page at a time; keyed by the search and filters. */
export function LibraryResults({
  ranked,
  nameOf,
  canSave,
}: ResultsProps): ReactElement {
  const { shown: matches, more } = usePaged(ranked, pageSize);

  return (
    <>
      <Table striped borderless size="sm" className="align-middle">
        <tbody>
          {matches.map((entry) => (
            <LibraryRow
              key={entry.type}
              entry={entry}
              name={nameOf(entry)}
              canSave={canSave}
            />
          ))}
        </tbody>
      </Table>

      {more}
    </>
  );
}

/** The catalog is derived from ELI, whose licence asks for this. */
export function CatalogCredit(): ReactElement {
  const msm = useMapSettingsMessages();

  return (
    <div className="text-muted small mt-3">
      <Text m={msm} k="catalogCredit" />{' '}
      <a
        href="https://github.com/osmlab/editor-layer-index"
        target="_blank"
        rel="noopener noreferrer"
      >
        OSM Editor Layer Index
      </a>{' '}
      (
      <a
        href="https://creativecommons.org/licenses/by-sa/3.0/"
        target="_blank"
        rel="noopener noreferrer"
      >
        CC BY-SA 3.0
      </a>
      )
    </div>
  );
}
