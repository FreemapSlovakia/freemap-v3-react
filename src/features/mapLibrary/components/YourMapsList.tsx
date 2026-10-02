import { setActiveModal } from '@app/store/actions.js';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isCachedMapComplete } from '@features/cachedMaps/cachedTileMaps.js';
import { cachedMapsSetView } from '@features/cachedMaps/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type LayerSettings,
  mapLayerSettingsChange,
  mapOverlayOrderSet,
} from '@features/map/model/actions.js';
import type { MapCombination } from '@features/map/model/mapCombination.js';
import { combinationOpacity } from '@features/map/model/mapCombination.js';
import { activeCombinationsSelector } from '@features/map/model/selectors.js';
import { OpacityButton } from '@features/mapSettings/components/OpacityButton.js';
import { ToolbarIcon } from '@features/mapSettings/components/ToolbarIcon.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { useCustomMapActions } from '@features/mapSettings/useCustomMapActions.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { CustomMapGlyph } from '@shared/components/CustomMapGlyph.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerLabel, layerName } from '@shared/layerName.js';
import {
  type CustomLayerDef,
  flaggedCountries,
  resolveLayerAlias,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { scrollIntoCenter } from '@shared/scrollIntoCenter.js';
import type { Shortcut } from '@shared/types/common.js';
import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react';
import { Form, Table } from 'react-bootstrap';
import {
  FaAdjust,
  FaCamera,
  FaDownload,
  FaEye,
  FaHistory,
  FaKeyboard,
  FaPencilAlt,
  FaRegListAlt,
  FaTrash,
} from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  type CategoryGroup,
  categoryGroup,
  coversView,
  nameMatches,
  passes,
  type TechnologyGroup,
  technologyGroup,
} from '../filters.js';
import { mapLibraryPreviewStart } from '../model/actions.js';
import {
  installedLibraryIndexSelector,
  integratedLayerDefMapSelector,
  libraryIndexByIdSelector,
  overlayStackSelector,
  overlayZIndexSelector,
} from '../model/selectors.js';
import {
  FilterChips,
  FilterCountry,
  FilterPanel,
  FilterToggle,
  passesCountry,
  useMapDetail,
  useSharedFilterOptions,
} from './FilterChips.js';

/** A map the user has: installed from the library, or their own. */
type YourMap = {
  type: string;
  layer: 'base' | 'overlay';
  name: string;
  /** A second line: category and technology, or what a combination holds. */
  detail?: string;
  icon: ReactNode;
  countries?: string[];
  /** Where it draws, as `coversView` reads it; none means everywhere. */
  coverage?: { countries?: string[]; bbox?: [number, number, number, number] };
  legacy: boolean;
  /** Library maps are previewed and uninstalled; the rest are edited elsewhere. */
  kind: 'library' | 'custom' | 'cached' | 'combination';
  /** The user's own definition, which the row edits and deletes. */
  custom?: CustomLayerDef;
  combination?: MapCombination;
  defaultInMenu: boolean;
  defaultInToolbar: boolean;
  defaultShortcut?: Shortcut;
  /** A combination has none of its own. */
  technology?: string;
  category?: string;
};

// The project adds no screen-reader-only text; dnd-kit would.
const NO_SCREEN_READER_TEXT = {
  screenReaderInstructions: { draggable: '' },
  announcements: {
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
};

// Fixed, so the base-map and overlay tables line up column for column.
const COLUMN_WIDTHS = {
  handle: '1.5rem',
  icon: '2rem',
  check: '2.5rem',
  opacity: '3rem',
  shortcut: '5rem',
  actions: '4rem',
};

export type YourMapKind =
  | 'builtIn'
  | 'fromLibrary'
  | 'custom'
  | 'offline'
  | 'combinations';

export type YourMapShown = 'toolbar' | 'menu' | 'shortcut' | 'hidden';

export type YourMapsFilters = {
  query: string;
  kinds: ReadonlySet<YourMapKind>;
  shown: ReadonlySet<YourMapShown>;
  technologies: ReadonlySet<TechnologyGroup>;
  categories: ReadonlySet<CategoryGroup>;
  /** A country code, or empty for all. */
  country: string;
  /** With a country picked, keep the maps that name none. */
  worldwide: boolean;
  coversView: boolean;
};

const kindOf = (map: YourMap): YourMapKind =>
  map.kind === 'library'
    ? isCatalogId(map.type)
      ? 'fromLibrary'
      : 'builtIn'
    : map.kind === 'cached'
      ? 'offline'
      : map.kind === 'combination'
        ? 'combinations'
        : 'custom';

export const initialYourMapsFilters: YourMapsFilters = {
  query: '',
  kinds: new Set(),
  shown: new Set(),
  technologies: new Set(),
  categories: new Set(),
  country: '',
  worldwide: true,
  coversView: false,
};

type TabProps = {
  filters: YourMapsFilters;
  onChange: (filters: YourMapsFilters) => void;
  canSave: boolean;
  highlight?: string;
  searchRef: RefObject<HTMLInputElement | null>;
};

/** Your maps: their search, their filters and the list. */
export function YourMapsTab({
  filters,
  onChange,
  canSave,
  highlight,
  searchRef,
}: TabProps): ReactElement {
  const msm = useMapSettingsMessages();

  const { categoryOptions, technologyOptions } = useSharedFilterOptions();

  // The user's own maps name no country, so the installed library maps'.
  const installedIndex = useAppSelector(installedLibraryIndexSelector);

  return (
    <>
      <Form.Control
        type="search"
        ref={searchRef}
        placeholder={msm?.filters.filterYourMaps}
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.currentTarget.value })}
        className="mb-2"
      />

      <FilterPanel>
        <FilterChips
          name="your-category"
          label={msm?.filters.category}
          options={categoryOptions}
          selected={filters.categories}
          onChange={(categories) => onChange({ ...filters, categories })}
        />

        <FilterChips
          name="your-technology"
          label={msm?.filters.technology}
          options={technologyOptions}
          selected={filters.technologies}
          onChange={(technologies) => onChange({ ...filters, technologies })}
        />

        <FilterCountry
          label={msm?.filters.country}
          anyLabel={msm?.filters.anyCountry}
          value={filters.country}
          countryLists={installedIndex.map((def) => def.countries)}
          onChange={(country) => onChange({ ...filters, country })}
          name="your-country"
          worldwide={filters.worldwide}
          worldwideLabel={msm?.filters.includeWorldwide}
          onWorldwideChange={(worldwide) => onChange({ ...filters, worldwide })}
        />

        <FilterChips
          name="kind"
          label={msm?.filters.kind}
          options={[
            { value: 'builtIn', label: msm?.filters.builtIn },
            { value: 'fromLibrary', label: msm?.filters.fromLibrary },
            { value: 'custom', label: msm?.filters.custom },
            { value: 'offline', label: msm?.filters.offline },
            { value: 'combinations', label: msm?.filters.combinations },
          ]}
          selected={filters.kinds}
          onChange={(kinds) => onChange({ ...filters, kinds })}
        />

        <FilterChips
          name="shown"
          label={msm?.filters.shownIn}
          options={[
            { value: 'toolbar', label: msm?.filters.toolbar },
            { value: 'menu', label: msm?.filters.menu },
            { value: 'hidden', label: msm?.filters.hidden },
            { value: 'shortcut', label: msm?.filters.shortcut },
          ]}
          selected={filters.shown}
          onChange={(shown) => onChange({ ...filters, shown })}
        />

        <FilterToggle
          name="your-covers-view"
          label={msm?.filters.coversView}
          checked={filters.coversView}
          onChange={(coversView) => onChange({ ...filters, coversView })}
        />
      </FilterPanel>

      <YourMapsList canSave={canSave} filters={filters} highlight={highlight} />
    </>
  );
}

type Props = {
  canSave: boolean;
  filters: YourMapsFilters;
  /** A map to scroll to and flash, as just saved or asked for. */
  highlight?: string;
};

/** The maps the user has, by kind, each with its settings in columns. */
export function YourMapsList({
  canSave,
  filters,
  highlight,
}: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const installedIndex = useAppSelector(installedLibraryIndexSelector);

  const libraryIndexById = useAppSelector(libraryIndexByIdSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const mapCombinations = useAppSelector((state) => state.map.mapCombinations);

  const { stack, movable } = useAppSelector(overlayStackSelector);

  const overlayZIndex = useAppSelector(overlayZIndexSelector);

  const dispatch = useDispatch();

  // Only while filtering by it, or every pan would rebuild the list.
  const viewBounds = useAppSelector((state) =>
    filters.coversView ? state.map.bounds : undefined,
  );

  const viewCountries = useAppSelector((state) =>
    filters.coversView ? state.map.countries : undefined,
  );

  const mapDetail = useMapDetail();

  const nameOr = (def: { type: string; name?: string }) => layerLabel(def, m);

  // A retired layer by its successor's name, as applying the combination does.
  const defOf = (type: string) => {
    const resolved = resolveLayerAlias(type)[0] ?? type;

    return (
      libraryIndexById[resolved] ??
      customLayers.find((def) => def.type === resolved) ?? {
        type: resolved,
        category: undefined,
      }
    );
  };

  const baseName = (type: string) => nameOr(defOf(type));

  // Custom, offline and combined maps are in the menu unless taken out, as the
  // map menu has them.
  const maps: YourMap[] = [
    ...installedIndex.map(
      (def): YourMap => ({
        type: def.type,
        layer: def.layer,
        name: layerName(def, m) ?? def.type,
        icon: def.icon,
        countries: flaggedCountries(def),
        coverage: { countries: def.countries, bbox: def.bbox },
        detail: mapDetail(def.category, def.technology),
        legacy: Boolean(def.superseededBy),
        kind: 'library',
        defaultInMenu: Boolean(def.defaultInMenu),
        defaultInToolbar: Boolean(def.defaultInToolbar),
        defaultShortcut: def.shortcut,
        technology: def.technology,
        category: def.category,
      }),
    ),
    ...customLayers.map(
      (def): YourMap => ({
        type: def.type,
        layer: def.layer,
        name: nameOr(def),
        detail: mapDetail(def.category, def.technology),
        icon: <CustomMapGlyph spec={def.iconSpec} kind={def.technology} />,
        legacy: false,
        coverage: { bbox: def.bbox },
        kind: 'custom',
        custom: def,
        category: def.category,
        defaultInMenu: true,
        defaultInToolbar: false,
        technology: def.technology,
      }),
    ),
    ...cachedMaps.filter(isCachedMapComplete).map(
      (cm): YourMap => ({
        type: cm.type,
        layer: cm.layer,
        name: nameOr(cm),
        // The map it was downloaded from, whose category it takes.
        detail: mapDetail(
          defOf(cm.sourceType).category,
          undefined,
          msm?.filters.offline,
          baseName(cm.sourceType),
        ),
        category: defOf(cm.sourceType).category,
        icon: <CustomMapGlyph spec={cm.iconSpec} kind="cached" />,
        legacy: false,
        coverage: { bbox: cm.bounds },
        kind: 'cached',
        defaultInMenu: true,
        defaultInToolbar: false,
        technology: cm.technology,
      }),
    ),
    ...mapCombinations.map(
      (combination): YourMap => ({
        type: combination.id,
        layer: combination.base === undefined ? 'overlay' : 'base',
        name: combination.name,
        // What it puts on the map: its base map, or none, and its overlays.
        detail: [
          msm?.combination,
          (combination.base === undefined
            ? m?.mapLayers.layer.overlay
            : baseName(combination.base)) +
            (combination.overlays.length > 0
              ? ` + ${combination.overlays.length}`
              : ''),
        ].join(' · '),
        icon: <CustomMapGlyph spec={combination.iconSpec} kind="combination" />,
        legacy: false,
        kind: 'combination',
        combination,
        defaultInMenu: true,
        defaultInToolbar: false,
      }),
    ),
  ];

  // Where a map shows up, as the menu and the keyboard have it.
  const shownOf = (map: YourMap): YourMapShown[] => {
    const settings = layersSettings[map.type];

    const toolbar = settings?.showInToolbar ?? map.defaultInToolbar;

    const menu = settings?.showInMenu ?? map.defaultInMenu;

    const shortcut =
      (settings?.shortcut === undefined
        ? map.defaultShortcut
        : settings.shortcut) != null;

    return [
      ...(toolbar ? (['toolbar'] as const) : []),
      ...(menu ? (['menu'] as const) : []),
      ...(shortcut ? (['shortcut'] as const) : []),
      ...(!toolbar && !menu ? (['hidden'] as const) : []),
    ];
  };

  // The highlighted map shows whatever the filters, or the save looks lost.
  const visible = maps.filter(
    (map) =>
      map.type === highlight ||
      ((!filters.query.trim() || nameMatches(map.name, filters.query)) &&
        passes(filters.kinds, kindOf(map)) &&
        passes(filters.shown, shownOf(map)) &&
        passes(filters.technologies, technologyGroup(map.technology)) &&
        passes(filters.categories, categoryGroup(map.category)) &&
        passesCountry(map.coverage?.countries, filters) &&
        (!filters.coversView ||
          coversView(
            { type: map.type, ...map.coverage },
            { bounds: viewBounds, countries: viewCountries },
          ))),
  );

  // A drag reorders the whole stack, so only with every overlay in view.
  const sortable =
    canSave &&
    !filters.query.trim() &&
    !filters.kinds.size &&
    !filters.shown.size &&
    !filters.technologies.size &&
    !filters.country &&
    !filters.categories.size &&
    !filters.coversView;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    // Only what may move: the rest keep their place by themselves.
    const order = stack.filter((type) => movable.has(type));

    dispatch(
      mapOverlayOrderSet(
        arrayMove(
          order,
          order.indexOf(String(active.id)),
          order.indexOf(String(over.id)),
        ),
      ),
    );
  };

  if (maps.length === 0) {
    return <p className="text-muted text-center">{msm?.noInstalledMaps}</p>;
  }

  if (visible.length === 0) {
    return <p className="text-muted text-center">{m?.mapLayers.noMapsFound}</p>;
  }

  return (
    <>
      {(['base', 'overlay'] as const).map((layer) => {
        const rows = visible.filter((map) => map.layer === layer);

        // Overlays as they stack, top first; combinations, which don't, after.
        if (layer === 'overlay') {
          rows.sort(
            (a, b) =>
              (overlayZIndex[b.type] ?? 0) - (overlayZIndex[a.type] ?? 0),
          );
        }

        // Pinned and offline overlays, combinations and a map still loading,
        // not yet in the stack, stay put.
        const draggable = (map: YourMap) =>
          sortable && layer === 'overlay' && movable.has(map.type);

        const sortableTypes = rows.filter(draggable).map((map) => map.type);

        // Only the overlays can be dragged; outside the table, as it renders
        // elements of its own.
        const withDrag = (table: ReactElement) =>
          layer === 'overlay' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              accessibility={NO_SCREEN_READER_TEXT}
            >
              {table}
            </DndContext>
          ) : (
            table
          );

        return (
          rows.length > 0 && (
            <section
              key={layer}
              // Set off from the base maps above it.
              className={
                layer === 'overlay' && visible.some((m) => m.layer === 'base')
                  ? 'border-top mt-3 pt-2'
                  : undefined
              }
            >
              {withDrag(
                <Table striped borderless size="sm" className="align-middle">
                  <colgroup>
                    <col style={{ width: COLUMN_WIDTHS.handle }} />
                    <col style={{ width: COLUMN_WIDTHS.icon }} />
                  </colgroup>

                  <thead>
                    <tr>
                      {/* The section's name, on the row of the column glyphs. */}
                      <th colSpan={3}>
                        {layer === 'base' ? msm?.baseMaps : msm?.overlays}
                      </th>

                      {/* `ms-n1`: the cell's padding already puts the glyph over
                        the checkbox below. */}
                      <th style={{ width: COLUMN_WIDTHS.check }}>
                        <GlyphMarker
                          hint={msm?.showInToolbar}
                          color={null}
                          className="ms-n1"
                        >
                          <ToolbarIcon />
                        </GlyphMarker>
                      </th>

                      <th style={{ width: COLUMN_WIDTHS.check }}>
                        <GlyphMarker
                          hint={msm?.showInMenu}
                          color={null}
                          className="ms-n1"
                        >
                          <FaRegListAlt />
                        </GlyphMarker>
                      </th>

                      {/* Base maps are opaque: their column stays, empty, so the
                        two tables line up. */}
                      <th
                        className="text-center"
                        style={{ width: COLUMN_WIDTHS.opacity }}
                      >
                        {layer === 'overlay' && (
                          <GlyphMarker hint={msm?.overlayOpacity} color={null}>
                            <FaAdjust />
                          </GlyphMarker>
                        )}
                      </th>

                      <th
                        className="text-center fm-should-have-keyboard"
                        style={{ width: COLUMN_WIDTHS.shortcut }}
                      >
                        <GlyphMarker hint={msm?.keyboardShortcut} color={null}>
                          <FaKeyboard />
                        </GlyphMarker>
                      </th>

                      <th style={{ width: COLUMN_WIDTHS.actions }} />
                    </tr>
                  </thead>

                  <SortableContext
                    items={sortableTypes}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody>
                      {rows.map((map) =>
                        draggable(map) ? (
                          <SortableYourMapRow
                            key={map.type}
                            map={map}
                            highlighted={map.type === highlight}
                            settings={layersSettings[map.type]}
                            canSave={canSave}
                          />
                        ) : (
                          <YourMapRow
                            key={map.type}
                            map={map}
                            highlighted={map.type === highlight}
                            settings={layersSettings[map.type]}
                            canSave={canSave}
                          />
                        ),
                      )}
                    </tbody>
                  </SortableContext>
                </Table>,
              )}
            </section>
          )
        );
      })}
    </>
  );
}

type RowProps = {
  map: YourMap;
  highlighted: boolean;
  settings: LayerSettings | undefined;
  canSave: boolean;
  /** For a row that can be dragged to another place in the stack. */
  drag?: {
    setNodeRef: (el: HTMLElement | null) => void;
    style: CSSProperties;
    handle: HTMLAttributes<HTMLElement>;
  };
};

function SortableYourMapRow(props: Omit<RowProps, 'drag'>): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.map.type });

  return (
    <YourMapRow
      {...props}
      drag={{
        setNodeRef,
        style: {
          transform: CSS.Translate.toString(transform),
          transition,
          // Above its neighbours while carried.
          position: isDragging ? 'relative' : undefined,
          zIndex: isDragging ? 1 : undefined,
        },
        // Focusable for the keyboard sensor; no screen-reader attributes.
        handle: { tabIndex: attributes.tabIndex, ...listeners },
      }}
    />
  );
}

function YourMapRow({
  map,
  highlighted,
  settings,
  canSave,
  drag,
}: RowProps): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const activeCombinations = useAppSelector(activeCombinationsSelector);

  const def = useAppSelector(
    (state) => integratedLayerDefMapSelector(state)[map.type],
  );

  const { type, combination } = map;

  const { deleteCustomMap, deleteCombination, updateCombinationFromMap } =
    useCustomMapActions();

  const change = (patch: LayerSettings) =>
    dispatch(mapLayerSettingsChange({ type, settings: patch }));

  // Not while an active combination sets it instead.
  const opacityEditable =
    map.layer === 'overlay' &&
    map.kind !== 'combination' &&
    combinationOpacity(activeCombinations, type) === undefined;

  return (
    <tr
      ref={drag?.setNodeRef}
      style={drag?.style}
      className={highlighted ? 'fm-flash' : undefined}
    >
      {/* The scroll on a ref of its own, stable, so it runs once per mount. */}
      <td ref={highlighted ? scrollIntoCenter : undefined}>
        {drag && (
          <span
            className="d-inline-flex text-muted"
            // The handle alone starts a drag; on touch it mustn't scroll.
            style={{ cursor: 'grab', touchAction: 'none' }}
            {...drag.handle}
          >
            <MdDragIndicator />
          </span>
        )}
      </td>

      <td>{map.icon}</td>

      <td className="w-100">
        {map.name}

        {map.legacy && (
          <GlyphMarker hint={m?.mapLayers.legacy}>
            <FaHistory />
          </GlyphMarker>
        )}

        {map.countries?.map((country) => (
          <CountryFlag key={country} country={country} />
        ))}

        {map.detail && <div className="small text-muted">{map.detail}</div>}
      </td>

      <td>
        <Form.Check
          disabled={!canSave}
          checked={settings?.showInToolbar ?? map.defaultInToolbar}
          onChange={(e) => change({ showInToolbar: e.currentTarget.checked })}
        />
      </td>

      <td>
        <Form.Check
          disabled={!canSave}
          checked={settings?.showInMenu ?? map.defaultInMenu}
          onChange={(e) => change({ showInMenu: e.currentTarget.checked })}
        />
      </td>

      <td className="text-center">
        {opacityEditable && canSave && (
          <OpacityButton
            value={resolveLayerOpacity(def, settings?.opacity)}
            onChange={(opacity) => change({ opacity })}
          />
        )}
      </td>

      <td className="text-center text-nowrap fm-should-have-keyboard">
        {canSave && (
          <ShortcutRecorder
            value={
              settings?.shortcut === undefined
                ? map.defaultShortcut
                : settings.shortcut
            }
            onChange={(shortcut) => change({ shortcut })}
          />
        )}
      </td>

      <td>
        <ResponsiveActions
          size="sm"
          align="end"
          toggleLabel={m?.general.actions}
        >
          {/* A combination is several layers, applied rather than switched,
              so it is refreshed from the map instead. */}
          {combination ? (
            <Action
              icon={<FaCamera />}
              label={msm?.updateFromCurrentMap}
              disabled={!canSave}
              onClick={() => updateCombinationFromMap(combination)}
              showFrom="never"
            />
          ) : (
            <Action
              icon={<FaEye />}
              label={msm?.preview}
              onClick={() => dispatch(mapLibraryPreviewStart({ type }))}
              showFrom="never"
            />
          )}

          {map.kind !== 'library' && (
            <Action
              icon={<FaPencilAlt />}
              label={m?.general.modify}
              disabled={map.kind !== 'cached' && !canSave}
              onClick={() => {
                if (map.kind === 'cached') {
                  // Opening the modal resets it to its list, so the form after.
                  dispatch(setActiveModal({ type: 'offline-maps' }));

                  dispatch(cachedMapsSetView({ edit: type }));
                } else {
                  dispatch(
                    setActiveModal({
                      type: 'installed-maps',
                      customMap: { edit: type },
                    }),
                  );
                }
              }}
              showFrom="never"
            />
          )}

          {/* Only image tiles can be downloaded; see `CacheTilesForm`. */}
          {(map.kind === 'library' || map.kind === 'custom') &&
            map.technology === 'tile' && (
              <Action
                icon={<FaDownload />}
                label={msm?.downloadOffline}
                onClick={() => {
                  // Opening the modal resets it to its list, so the form after.
                  dispatch(setActiveModal({ type: 'offline-maps' }));

                  dispatch(cachedMapsSetView({ add: type }));
                }}
                showFrom="never"
              />
            )}

          {/* An offline map is deleted with its tiles, in Offline maps. */}
          {map.kind !== 'cached' && <ActionDivider />}

          {map.kind !== 'cached' && (
            <Action
              icon={<FaTrash />}
              label={
                map.kind === 'library' ? msm?.uninstallMap : m?.general.delete
              }
              variant="danger"
              disabled={!canSave}
              onClick={() =>
                map.custom
                  ? deleteCustomMap(map.custom)
                  : combination
                    ? deleteCombination(combination)
                    : change({ installed: false })
              }
              showFrom="never"
            />
          )}
        </ResponsiveActions>
      </td>
    </tr>
  );
}
