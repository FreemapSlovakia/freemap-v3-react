import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { ToolbarIcon } from '@features/mapSettings/components/ToolbarIcon.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { regionName, useRegionNames } from '@shared/hooks/useRegionNames.js';
import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useMemo,
} from 'react';
import { Alert, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import {
  FaBookOpen,
  FaEyeSlash,
  FaFilter,
  FaGlobeEurope,
  FaKeyboard,
  FaLayerGroup,
  FaRegListAlt,
  FaTimes,
} from 'react-icons/fa';
import type { CatalogEntry } from '../catalog.js';
import {
  availableWanted,
  initialManagerFilters,
  type ManagerFilters,
} from '../filters.js';
import { searchLibrary } from '../librarySearch.js';
import {
  installedLibraryIndexSelector,
  yourMapsCountSelector,
} from '../model/selectors.js';
import { usePreparedCatalog } from '../searchTargets.js';
import {
  FilterChips,
  FilterCountry,
  FilterPanel,
  FilterToggle,
  useSharedFilterOptions,
} from './FilterChips.js';
import {
  CatalogCredit,
  LibraryResults,
  useLibraryRanked,
} from './LibraryList.js';
import {
  KIND_ICONS,
  KIND_OPTIONS,
  useYourMaps,
  YourMapsTable,
} from './YourMapsList.js';

type Props = {
  catalog: CatalogEntry[] | undefined;
  /** The catalog's maps that are not installed. */
  entries: CatalogEntry[];
  catalogFailed: boolean;
  filters: ManagerFilters;
  onChange: (filters: ManagerFilters) => void;
  /** Whether the filter panel is shown; kept by the modal, as the filters are. */
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  canSave: boolean;
  highlight?: string;
  searchRef: RefObject<HTMLInputElement | null>;
};

type ChipOption = { value: string; label: ReactNode; icon?: ReactNode };

/** A group of chips, both as the panel's row and as the active chips. */
type ChipGroup = {
  name: string;
  label?: ReactNode;
  options: ChipOption[];
  selected: ReadonlySet<string>;
  set: (selected: ReadonlySet<string>) => void;
};

// Widens a typed group to the shared shape; its `set` gets only its own values.
const chipGroup = <T extends string>(group: {
  name: string;
  label?: ReactNode;
  options: readonly { value: T; label: ReactNode; icon?: ReactNode }[];
  selected: ReadonlySet<T>;
  set: (selected: ReadonlySet<T>) => void;
}): ChipGroup => ({
  ...group,
  options: [...group.options],
  set: (selected) => group.set(selected as ReadonlySet<T>),
});

/** The installed maps, then the available ones, under one search and filters. */
export function MapManager({
  catalog,
  entries,
  filters,
  onChange,
  filtersOpen,
  onFiltersOpenChange,
  catalogFailed,
  canSave,
  highlight,
  searchRef,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const { categoryOptions, technologyOptions, layerOptions } =
    useSharedFilterOptions();

  const installedIndex = useAppSelector(installedLibraryIndexSelector);

  const yourMapsCount = useAppSelector(yourMapsCountSelector);

  const { rows: yourMaps, queryMatches: yourMapsMatch } = useYourMaps(
    filters,
    highlight,
  );

  const prepared = usePreparedCatalog(catalog);

  const ranked = useLibraryRanked(entries, prepared, filters);

  const nameOf = (entry: CatalogEntry) =>
    prepared.get(entry.type)?.name ?? entry.type;

  const { query } = filters;

  // A search that matches nothing in the whole catalog nor among the user's
  // own maps may name a map we lack; one emptied by the filters doesn't.
  const unknownMap = useMemo(() => {
    // Asked only once nothing shown matches: it searches the whole catalog.
    if (
      !query.trim() ||
      !catalog ||
      ranked.length > 0 ||
      yourMaps.length > 0 ||
      yourMapsMatch
    ) {
      return false;
    }

    const targets = catalog.flatMap(
      (entry) => prepared.get(entry.type)?.target ?? [],
    );

    return searchLibrary(targets, targets, query, 1).total === 0;
  }, [query, catalog, prepared, ranked, yourMaps.length, yourMapsMatch]);

  // Back to the first page on a new search or filter, but not when an install
  // or a preview changes the list under the user's scroll position.
  const pagingKey = JSON.stringify(filters, (_, value) =>
    value instanceof Set ? [...value] : value,
  );

  // A failed load was toasted; the installed maps stand on their own.
  const loading = availableWanted(filters) && !catalog && !catalogFailed;

  const groups = {
    status: chipGroup({
      name: 'status',
      options: [
        {
          value: 'installed',
          label: m?.mapLayers.installedMaps,
          icon: <FaLayerGroup />,
        },
        {
          value: 'available',
          label: m?.mapLayers.availableMaps,
          icon: <FaBookOpen />,
        },
      ],
      selected: filters.status,
      set: (status) => onChange({ ...filters, status }),
    }),
    category: chipGroup({
      name: 'category',
      label: msm?.filters.category,
      options: categoryOptions,
      selected: filters.categories,
      set: (categories) => onChange({ ...filters, categories }),
    }),
    technology: chipGroup({
      name: 'technology',
      label: msm?.filters.technology,
      options: technologyOptions,
      selected: filters.technologies,
      set: (technologies) => onChange({ ...filters, technologies }),
    }),
    layer: chipGroup({
      name: 'layer',
      label: m?.mapLayers.layer.layer,
      options: layerOptions,
      selected: filters.layers,
      set: (layers) => onChange({ ...filters, layers }),
    }),
    kind: chipGroup({
      name: 'kind',
      label: msm?.filters.kind,
      options: KIND_OPTIONS.map((value) => ({
        value,
        label: msm?.filters[value],
        icon: KIND_ICONS[value],
      })),
      selected: filters.kinds,
      set: (kinds) => onChange({ ...filters, kinds }),
    }),
    shown: chipGroup({
      name: 'shown',
      label: msm?.filters.shownIn,
      options: [
        {
          value: 'toolbar',
          label: msm?.filters.toolbar,
          icon: <ToolbarIcon />,
        },
        { value: 'menu', label: msm?.filters.menu, icon: <FaRegListAlt /> },
        { value: 'hidden', label: msm?.filters.hidden, icon: <FaEyeSlash /> },
        {
          value: 'shortcut',
          label: msm?.filters.shortcut,
          icon: <FaKeyboard />,
        },
      ],
      selected: filters.shown,
      set: (shown) => onChange({ ...filters, shown }),
    }),
  };

  const chipRow = (group: ChipGroup) => (
    <FilterChips
      name={group.name}
      label={group.label}
      options={group.options}
      selected={group.selected}
      onChange={group.set}
    />
  );

  const regionNames = useRegionNames();

  // What is on, each to switch off without opening the panel.
  const activeChips = [
    ...Object.values(groups).flatMap((group) =>
      group.options
        .filter(({ value }) => group.selected.has(value))
        .map(({ value, label, icon }) => ({
          key: `${group.name}-${value}`,
          icon,
          label,
          off: () => group.set(group.selected.difference(new Set([value]))),
        })),
    ),
    ...(filters.country
      ? [
          {
            key: 'country',
            icon: <CountryFlag country={filters.country} />,
            label: regionName(regionNames, filters.country),
            off: () => onChange({ ...filters, country: '' }),
          },
        ]
      : []),
    ...(filters.coversView
      ? [
          {
            key: 'covers-view',
            icon: <FaGlobeEurope />,
            label: msm?.filters.coversView,
            off: () => onChange({ ...filters, coversView: false }),
          },
        ]
      : []),
  ];

  // Groups, not chips: one group's chips together narrow by one thing.
  const activeCount =
    Object.values(groups).filter((group) => group.selected.size > 0).length +
    Number(Boolean(filters.country)) +
    Number(filters.coversView);

  return (
    <>
      <InputGroup className="mb-2">
        <Form.Control
          type="search"
          ref={searchRef}
          placeholder={msm?.searchLibrary({
            count: yourMapsCount + entries.length,
          })}
          value={query}
          onChange={(e) =>
            onChange({ ...filters, query: e.currentTarget.value })
          }
        />

        {/* On a phone the icon alone, the word on long press. */}
        <LongPressTooltip label={msm?.filters.toggle} breakpoint="sm">
          {({ props, label, labelClassName }) => (
            <Button
              variant="outline-primary"
              active={filtersOpen}
              aria-pressed={filtersOpen}
              onClick={() => onFiltersOpenChange(!filtersOpen)}
              {...props}
            >
              <FaFilter /> <span className={labelClassName}>{label}</span>
              {activeCount > 0 && (
                <Badge pill bg="danger" className="ms-1">
                  {activeCount}
                </Badge>
              )}
            </Button>
          )}
        </LongPressTooltip>
      </InputGroup>

      {!filtersOpen && activeChips.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {activeChips.map(({ key, icon, label, off }) => (
            <Button key={key} size="sm" variant="primary" onClick={off}>
              {icon} {label} <FaTimes />
            </Button>
          ))}

          <Button
            size="sm"
            variant="link"
            onClick={() => onChange({ ...initialManagerFilters, query })}
          >
            {msm?.filters.clear}
          </Button>
        </div>
      )}

      {filtersOpen && (
        <FilterPanel>
          {chipRow(groups.status)}

          {chipRow(groups.category)}

          {chipRow(groups.technology)}

          <FilterCountry
            label={msm?.filters.country}
            anyLabel={msm?.filters.anyCountry}
            value={filters.country}
            countryLists={[
              ...installedIndex.map((def) => def.countries),
              ...entries.map((entry) => entry.countries),
            ]}
            onChange={(country) => onChange({ ...filters, country })}
            name="country"
            multiCountry={filters.multiCountry}
            multiCountryLabel={msm?.filters.includeMultiCountry}
            onMultiCountryChange={(multiCountry) =>
              onChange({ ...filters, multiCountry })
            }
          />

          {chipRow(groups.layer)}

          {chipRow(groups.kind)}

          {chipRow(groups.shown)}

          <FilterToggle
            name="covers-view"
            icon={<FaGlobeEurope />}
            label={msm?.filters.coversView}
            checked={filters.coversView}
            onChange={(coversView) => onChange({ ...filters, coversView })}
          />
        </FilterPanel>
      )}

      {yourMaps.length > 0 && (
        <YourMapsTable
          rows={yourMaps}
          canSave={canSave}
          highlight={highlight}
          // In the header row, beside the column marks; a `<th>` takes no heading element.
          heading={
            <span className="h6 text-muted fw-normal mb-0">
              <FaLayerGroup /> <Text k="mapLayers.installedMaps" /> (
              {yourMaps.length})
            </span>
          }
        />
      )}

      {ranked.length > 0 && (
        <>
          <h6 className="text-muted mt-3 mb-1">
            <FaBookOpen /> <Text k="mapLayers.availableMaps" /> ({ranked.length}
            )
          </h6>

          {/* Above the list, which loads more as it is scrolled. */}
          <CatalogCredit />

          <LibraryResults
            key={pagingKey}
            ranked={ranked}
            nameOf={nameOf}
            canSave={canSave}
          />
        </>
      )}

      {loading ? (
        <p className="text-muted text-center">
          <Text k="general.loading" />
        </p>
      ) : (
        yourMaps.length === 0 &&
        ranked.length === 0 && (
          <>
            <p className="text-muted text-center">
              <Text k="mapLayers.noMapsFound" />
            </p>

            {unknownMap && (
              <Alert variant="info">
                <Text m={msm}>{(msm) => msm.suggestMap}</Text>
              </Alert>
            )}
          </>
        )
      )}
    </>
  );
}
