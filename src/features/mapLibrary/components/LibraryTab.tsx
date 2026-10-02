import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerName } from '@shared/layerName.js';
import { flaggedCountries } from '@shared/mapDefinitions.js';
import { catalogIcon } from '@shared/mapLibrary/catalogMap.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import {
  type ReactElement,
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Button, Form, Table } from 'react-bootstrap';
import { FaEye, FaHistory, FaPlus } from 'react-icons/fa';
import { shallowEqual, useDispatch } from 'react-redux';
import { type CatalogEntry, loadLibraryCatalog } from '../catalog.js';
import {
  type CategoryGroup,
  categoryGroup,
  coversView,
  passes,
  type TechnologyGroup,
  technologyGroup,
} from '../filters.js';
import {
  prepareSearchTarget,
  type SearchTarget,
  searchLibrary,
} from '../librarySearch.js';
import {
  mapLibraryCatalogMapsLoaded,
  mapLibraryPreviewStart,
} from '../model/actions.js';
import {
  FilterChips,
  FilterCountry,
  FilterPanel,
  FilterToggle,
  passesCountry,
  useMapDetail,
  useSharedFilterOptions,
} from './FilterChips.js';

/** Rows added each time the list is scrolled to its end. */
const pageSize = 50;

export type LibraryFilters = {
  query: string;
  layers: ReadonlySet<'base' | 'overlay'>;
  categories: ReadonlySet<CategoryGroup>;
  technologies: ReadonlySet<TechnologyGroup>;
  /** A country code, or empty for all. */
  country: string;
  /** With a country picked, keep the maps that name none. */
  worldwide: boolean;
  coversView: boolean;
};

export const initialLibraryFilters: LibraryFilters = {
  query: '',
  layers: new Set(),
  categories: new Set(),
  technologies: new Set(),
  country: '',
  worldwide: true,
  coversView: false,
};

/**
 * The catalog, once loaded, and what of it can still be added; what is
 * installed is under Installed maps.
 */
export function useLibraryEntries(): {
  catalog: CatalogEntry[] | undefined;
  entries: CatalogEntry[];
} {
  const dispatch = useDispatch();

  const [catalog, setCatalog] = useState<CatalogEntry[]>();

  useEffect(() => {
    let live = true;

    loadLibraryCatalog().then(
      (entries) => {
        if (live) {
          setCatalog(entries);
        }
      },
      (err: unknown) => {
        dispatch(
          toastsAdd({
            id: 'mapLibrary.catalogError',
            messageKey: 'general.loadError',
            messageParams: { err },
            style: 'danger',
          }),
        );
      },
    );

    return () => {
      live = false;
    };
  }, [dispatch]);

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  // The maps whose settings make them differ from their default install state,
  // so an opacity or a tick doesn't refilter the catalog.
  const overridden = useAppSelector(
    (state) =>
      Object.keys(state.map.layersSettings).filter(
        (type) =>
          isLayerInstalled(state.map.layersSettings, type) !==
          isLayerInstalled({}, type),
      ),
    shallowEqual,
  );

  const entries = useMemo(() => {
    const flipped = new Set(overridden);

    return (
      catalog?.filter(
        (entry) =>
          isLayerInstalled({}, entry.type) === flipped.has(entry.type) &&
          (canPreviewLayers || !entry.index?.layerPreview),
      ) ?? []
    );
  }, [catalog, canPreviewLayers, overridden]);

  return { catalog, entries };
}

type LibraryRowProps = {
  entry: CatalogEntry;
  name: string;
  canSave: boolean;
};

function LibraryRow({ entry, name, canSave }: LibraryRowProps): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const mapDetail = useMapDetail();

  const dispatch = useDispatch();

  const { type, index, map } = entry;

  // The store learns a catalog map before it is shown or installed, so the
  // map reducer knows its kind and the menus its name.
  const makeKnown = () => {
    if (map) {
      dispatch(mapLibraryCatalogMapsLoaded([map]));
    }
  };

  return (
    <tr>
      <td>{index ? index.icon : catalogIcon(entry.category)}</td>

      <td className="w-100">
        {name}

        {index?.superseededBy && (
          <GlyphMarker hint={m?.mapLayers.legacy}>
            <FaHistory />
          </GlyphMarker>
        )}

        {flaggedCountries(entry)?.map((country) => (
          <CountryFlag key={country} country={country} />
        ))}

        <div className="small text-muted">
          {mapDetail(entry.category, entry.index?.technology ?? 'tile')}
        </div>
      </td>

      <td>
        <LongPressTooltip label={msm?.preview}>
          {({ props }) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                makeKnown();

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
              onClick={() => {
                makeKnown();

                dispatch(
                  mapLayerSettingsChange({
                    type,
                    settings: { installed: true },
                  }),
                );
              }}
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

type Prepared = { name: string; target: SearchTarget };

type Props = {
  catalog: CatalogEntry[] | undefined;
  entries: CatalogEntry[];
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
  canSave: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
};

/** Search and browse the catalog for maps to add. */
export function LibraryTab({
  catalog,
  entries,
  filters,
  onChange,
  canSave,
  searchRef,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const { categoryOptions, technologyOptions } = useSharedFilterOptions();

  const { query } = filters;

  // Only when it decides something: covering filters it, browsing sorts by it.
  const needsView = filters.coversView || !query.trim();

  const viewBounds = useAppSelector((state) =>
    needsView ? state.map.bounds : undefined,
  );

  const viewCountries = useAppSelector((state) =>
    needsView ? state.map.countries : undefined,
  );

  // Per catalog and language, so an install doesn't redo the whole catalog.
  const prepared = useMemo(() => {
    const countryNames = new Intl.DisplayNames([language], { type: 'region' });

    return new Map<string, Prepared>(
      (catalog ?? []).map((entry) => {
        const name = layerName(entry, m) ?? entry.type;

        return [
          entry.type,
          {
            name,
            target: prepareSearchTarget(name, [
              ...(m?.search.commands.keywords[`layer-${entry.type}`]?.split(
                ',',
              ) ?? []),
              ...(entry.countries ?? []).flatMap((country) => [
                country,
                countryNames.of(country.toUpperCase()) ?? '',
              ]),
              entry.category ?? '',
            ]),
          },
        ];
      }),
    );
  }, [catalog, m, language]);

  const nameOf = (entry: CatalogEntry) =>
    prepared.get(entry.type)?.name ?? entry.type;

  // Base maps before overlays, so a page only ever extends the last section.
  const ranked = useMemo(() => {
    const view = { bounds: viewBounds, countries: viewCountries };

    const items = entries.flatMap((entry) => {
      const prep = prepared.get(entry.type);

      return prep &&
        passes(filters.layers, entry.layer) &&
        passes(filters.categories, categoryGroup(entry.category)) &&
        passes(
          filters.technologies,
          technologyGroup(entry.index?.technology ?? 'tile'),
        ) &&
        passesCountry(entry.countries, filters) &&
        (!filters.coversView || coversView(entry, view))
        ? [{ entry, ...prep }]
        : [];
    });

    let ordered: CatalogEntry[];

    if (filters.query.trim()) {
      ordered = searchLibrary(
        items.map(({ entry }) => entry),
        items.map(({ target }) => target),
        filters.query,
        items.length,
      ).matches;
    } else {
      // Browsing: the maps that draw here first, each part by name.
      const byName = makeLabelComparator(language);

      ordered = items
        .map(({ entry, name }) => ({
          entry,
          name,
          here: coversView(entry, view),
        }))
        .sort(
          (a, b) => Number(b.here) - Number(a.here) || byName(a.name, b.name),
        )
        .map(({ entry }) => entry);
    }

    return [
      ...ordered.filter((entry) => entry.layer === 'base'),
      ...ordered.filter((entry) => entry.layer === 'overlay'),
    ];
  }, [entries, filters, prepared, viewBounds, viewCountries, language]);

  // A search that matches nothing at all, installed maps included, may name a
  // map we lack; one emptied by the filters or an install doesn't.
  const unknownMap = useMemo(() => {
    if (!query.trim() || !catalog) {
      return false;
    }

    const targets = catalog.flatMap(
      (entry) => prepared.get(entry.type)?.target ?? [],
    );

    return searchLibrary(targets, targets, query, 1).total === 0;
  }, [query, catalog, prepared]);

  // Back to the first page on a new search or filter, but not when an install
  // or a preview changes the list under the user's scroll position.
  const pagingKey = JSON.stringify(filters, (_, value) =>
    value instanceof Set ? [...value] : value,
  );

  return (
    <>
      <Form.Control
        type="search"
        ref={searchRef}
        placeholder={msm?.searchLibrary({ count: entries.length })}
        value={query}
        onChange={(e) => onChange({ ...filters, query: e.currentTarget.value })}
        className="mb-2"
      />

      {/* Category and Technology first, then this tab's own rows, as in
          Installed maps; Covers this view last in both. */}
      <FilterPanel>
        <FilterChips
          name="category"
          label={msm?.filters.category}
          options={categoryOptions}
          selected={filters.categories}
          onChange={(categories) => onChange({ ...filters, categories })}
        />

        <FilterChips
          name="library-technology"
          label={msm?.filters.technology}
          options={technologyOptions}
          selected={filters.technologies}
          onChange={(technologies) => onChange({ ...filters, technologies })}
        />

        <FilterCountry
          label={msm?.filters.country}
          anyLabel={msm?.filters.anyCountry}
          value={filters.country}
          countryLists={entries.map((entry) => entry.countries)}
          onChange={(country) => onChange({ ...filters, country })}
          name="library-country"
          worldwide={filters.worldwide}
          worldwideLabel={msm?.filters.includeWorldwide}
          onWorldwideChange={(worldwide) => onChange({ ...filters, worldwide })}
        />

        <FilterChips
          name="library-layer"
          label={m?.mapLayers.layer.layer}
          options={[
            { value: 'base', label: msm?.baseMaps },
            { value: 'overlay', label: msm?.overlays },
          ]}
          selected={filters.layers}
          onChange={(layers) => onChange({ ...filters, layers })}
        />

        <FilterToggle
          name="library-covers-view"
          label={msm?.filters.coversView}
          checked={filters.coversView}
          onChange={(coversView) => onChange({ ...filters, coversView })}
        />
      </FilterPanel>

      {!catalog ? (
        <p className="text-muted text-center">{m?.general.loading}</p>
      ) : ranked.length === 0 ? (
        <>
          <p className="text-muted text-center">{m?.mapLayers.noMapsFound}</p>

          {unknownMap && <Alert variant="info">{msm?.suggestMap}</Alert>}
        </>
      ) : (
        <LibraryResults
          key={pagingKey}
          ranked={ranked}
          nameOf={nameOf}
          canSave={canSave}
        />
      )}

      {/* The catalog is derived from ELI, whose licence asks for this. */}
      <div className="text-muted small mt-3">
        {msm?.catalogCredit}{' '}
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
    </>
  );
}

type ResultsProps = {
  ranked: CatalogEntry[];
  nameOf: (entry: CatalogEntry) => string;
  canSave: boolean;
};

/** The ranked results, a page at a time; keyed by the search and filters. */
function LibraryResults({
  ranked,
  nameOf,
  canSave,
}: ResultsProps): ReactElement {
  const msm = useMapSettingsMessages();

  const [limit, setLimit] = useState(pageSize);

  const matches = ranked.slice(0, limit);

  // Keyed by `limit`, so a sentinel still in view after a page is a new
  // element, observed anew, and loads the next one too.
  const observeMore = (el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();

          setLimit((limit) => limit + pageSize);
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(el);

    return () => observer.disconnect();
  };

  return (
    <>
      {(['base', 'overlay'] as const).map((layer) => {
        const rows = matches.filter((entry) => entry.layer === layer);

        return (
          rows.length > 0 && (
            <section
              key={layer}
              // Set off from the base maps above it.
              className={
                layer === 'overlay' && matches.some((e) => e.layer === 'base')
                  ? 'border-top mt-3 pt-2'
                  : undefined
              }
            >
              <h6 className="mt-2">
                {layer === 'base' ? msm?.baseMaps : msm?.overlays}
              </h6>

              <Table striped borderless size="sm" className="align-middle">
                <tbody>
                  {rows.map((entry) => (
                    <LibraryRow
                      key={entry.type}
                      entry={entry}
                      name={nameOf(entry)}
                      canSave={canSave}
                    />
                  ))}
                </tbody>
              </Table>
            </section>
          )
        );
      })}

      {ranked.length > limit && <div key={limit} ref={observeMore} />}
    </>
  );
}
