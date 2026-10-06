import { setActiveModal } from '@app/store/actions.js';
import { isCachedMapComplete } from '@features/cachedMaps/cachedTileMaps.js';
import { cachedMapsSetView } from '@features/cachedMaps/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type LayerSettings,
  mapLayerSettingsChange,
  mapLayerSetupChange,
  mapPresetChange,
  mapPresetToggle,
} from '@features/map/model/actions.js';
import { canSwitchKind } from '@features/map/model/layerKind.js';
import { type MapPreset, presetItem } from '@features/map/model/mapPreset.js';
import { OpacityButton } from '@features/mapSettings/components/OpacityButton.js';
import { ToolbarIcon } from '@features/mapSettings/components/ToolbarIcon.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { useCustomMapActions } from '@features/mapSettings/useCustomMapActions.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import {
  CUSTOM_MAP_ICONS,
  CustomMapGlyph,
} from '@shared/components/CustomMapGlyph.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import {
  LAYER_KIND_ICONS,
  LayerKindMark,
} from '@shared/components/MapLayerItem.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerLabel, layerName } from '@shared/layerName.js';
import {
  flaggedCountries,
  isNamedMapDef,
  resolveLayerAlias,
  resolveLayerOpacity,
  type StoredCustomLayerDef,
} from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { scrollIntoCenter } from '@shared/scrollIntoCenter.js';
import type { Shortcut } from '@shared/types/common.js';
import type { ReactElement, ReactNode, RefObject } from 'react';
import { Form, Table } from 'react-bootstrap';
import {
  FaCube,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaGlobeEurope,
  FaHistory,
  FaKeyboard,
  FaPencilAlt,
  FaRegListAlt,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { MdLibraryAdd, MdOfflinePin, MdOpacity } from 'react-icons/md';
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
import { canPreview, mapLibraryPreviewStart } from '../model/actions.js';
import {
  installedLibraryIndexSelector,
  mapByIdSelector,
  mapEntryOf,
  overlayZIndexSelector,
  presetKindsSelector,
  resolvedCustomLayersSelector,
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

/** A map the user has: installed from the library, or their own; or a preset. */
type YourMap = {
  type: string;
  /** As switched; a preset's by whether it holds a base map. */
  layer: 'base' | 'overlay';
  name: string;
  /** A second line: category and technology, or what a preset holds. */
  detail?: string;
  icon: ReactNode;
  countries?: string[];
  /** Where it draws, as `coversView` reads it; none means everywhere. */
  coverage?: { countries?: string[]; bbox?: [number, number, number, number] };
  legacy: boolean;
  /** Library maps are previewed and uninstalled; the rest are edited elsewhere. */
  kind: 'library' | 'custom' | 'cached' | 'preset';
  /** The user's own definition, which the row edits and deletes. */
  custom?: StoredCustomLayerDef;
  preset?: MapPreset;
  defaultInMenu: boolean;
  defaultInToolbar: boolean;
  defaultShortcut?: Shortcut;
  /** A preset has none of its own. */
  technology?: string;
  category?: string;
};

// Fixed, so the small columns stay narrow.
const COLUMN_WIDTHS = {
  kind: '1.75rem',
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
  | 'presets';

export type YourMapShown = 'toolbar' | 'menu' | 'shortcut' | 'hidden';

export type YourMapsFilters = {
  query: string;
  layers: ReadonlySet<'base' | 'overlay'>;
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
      : map.kind === 'preset'
        ? 'presets'
        : 'custom';

export const initialYourMapsFilters: YourMapsFilters = {
  query: '',
  layers: new Set(),
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
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const { categoryOptions, technologyOptions, layerOptions } =
    useSharedFilterOptions();

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
          name="your-layer"
          label={m?.mapLayers.layer.layer}
          options={layerOptions}
          selected={filters.layers}
          onChange={(layers) => onChange({ ...filters, layers })}
        />

        <FilterChips
          name="kind"
          label={msm?.filters.kind}
          options={[
            {
              value: 'builtIn',
              label: msm?.filters.builtIn,
              icon: <FaCube />,
            },
            {
              value: 'fromLibrary',
              label: msm?.filters.fromLibrary,
              icon: <MdLibraryAdd />,
            },
            { value: 'custom', label: msm?.filters.custom, icon: <FaUser /> },
            {
              value: 'offline',
              label: msm?.filters.offline,
              icon: <MdOfflinePin />,
            },
            {
              value: 'presets',
              label: msm?.filters.presets,
              icon: CUSTOM_MAP_ICONS.preset,
            },
          ]}
          selected={filters.kinds}
          onChange={(kinds) => onChange({ ...filters, kinds })}
        />

        <FilterChips
          name="shown"
          label={msm?.filters.shownIn}
          options={[
            {
              value: 'toolbar',
              label: msm?.filters.toolbar,
              icon: <ToolbarIcon />,
            },
            {
              value: 'menu',
              label: msm?.filters.menu,
              icon: <FaRegListAlt />,
            },
            {
              value: 'hidden',
              label: msm?.filters.hidden,
              icon: <FaEyeSlash />,
            },
            {
              value: 'shortcut',
              label: msm?.filters.shortcut,
              icon: <FaKeyboard />,
            },
          ]}
          selected={filters.shown}
          onChange={(shown) => onChange({ ...filters, shown })}
        />

        <FilterToggle
          name="your-covers-view"
          icon={<FaGlobeEurope />}
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

  const mapById = useAppSelector(mapByIdSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  // Of the kind they are switched to, as library maps are listed.
  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  const storedCustomLayers = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const presets = useAppSelector((state) => state.map.presets);

  const presetKinds = useAppSelector(presetKindsSelector);

  const overlayZIndex = useAppSelector(overlayZIndexSelector);

  // Only while filtering by it, or every pan would rebuild the list.
  const viewBounds = useAppSelector((state) =>
    filters.coversView ? state.map.bounds : undefined,
  );

  const viewCountries = useAppSelector((state) =>
    filters.coversView ? state.map.countries : undefined,
  );

  const mapDetail = useMapDetail();

  const nameOr = (def: { type: string; name?: string }) => layerLabel(def, m);

  // A retired layer by its successor's name, as opening a preset does.
  const defOf = (type: string) => {
    const resolved = resolveLayerAlias(type)[0] ?? type;

    return (
      mapEntryOf(mapById[resolved]) ?? { type: resolved, category: undefined }
    );
  };

  const baseName = (type: string) => nameOr(defOf(type));

  // Custom and offline maps and presets are in the menu unless taken out, as
  // the map menu has them.
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
    // A named map whose source can't be drawn (offline, gone from the
    // catalog): still listed, so it can be modified or deleted.
    ...storedCustomLayers
      .filter(
        (def) =>
          isNamedMapDef(def) &&
          !customLayers.some((drawn) => drawn.type === def.type),
      )
      .map(
        (def): YourMap => ({
          type: def.type,
          layer: def.layer,
          name: nameOr(def),
          icon: <CustomMapGlyph spec={def.iconSpec} />,
          legacy: false,
          kind: 'custom',
          custom: def,
          defaultInMenu: true,
          defaultInToolbar: false,
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
    ...presets.map(
      (preset): YourMap => ({
        type: preset.id,
        layer: presetKinds[preset.id] ?? 'overlay',
        name: preset.name,
        // What it puts on the map: its lowest layer and how many more.
        detail: [
          msm?.preset,
          preset.layers.length > 0
            ? baseName(preset.layers[0].type) +
              (preset.layers.length > 1 ? ` + ${preset.layers.length - 1}` : '')
            : '',
        ]
          .filter(Boolean)
          .join(' · '),
        icon: <CustomMapGlyph spec={preset.iconSpec} kind="preset" />,
        legacy: false,
        kind: 'preset',
        preset,
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
        passes(filters.layers, map.layer) &&
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

  if (maps.length === 0) {
    return <p className="text-muted text-center">{msm?.noInstalledMaps}</p>;
  }

  if (visible.length === 0) {
    return <p className="text-muted text-center">{m?.mapLayers.noMapsFound}</p>;
  }

  // Base maps, then overlays as they stack, top first; presets first in each.
  const stackPlace = (map: YourMap) =>
    map.layer === 'base'
      ? 0
      : -(overlayZIndex[map.preset ? presetItem(map.type) : map.type] ?? 0);

  const rows = visible.toSorted(
    (a, b) =>
      (a.layer === 'base' ? 0 : 1) - (b.layer === 'base' ? 0 : 1) ||
      (a.preset ? 0 : 1) - (b.preset ? 0 : 1) ||
      stackPlace(a) - stackPlace(b),
  );

  return (
    <Table striped borderless size="sm" className="align-middle">
      <colgroup>
        <col style={{ width: COLUMN_WIDTHS.kind }} />
        <col style={{ width: COLUMN_WIDTHS.icon }} />
      </colgroup>

      <thead>
        <tr>
          <th colSpan={3} />

          {/* `ms-n1`: the cell's padding already puts the glyph over the
              checkbox below. */}
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
            <GlyphMarker hint={msm?.showInMenu} color={null} className="ms-n1">
              <FaRegListAlt />
            </GlyphMarker>
          </th>

          <th className="text-center" style={{ width: COLUMN_WIDTHS.opacity }}>
            <GlyphMarker hint={msm?.overlayOpacity} color={null}>
              <MdOpacity />
            </GlyphMarker>
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

      <tbody>
        {rows.map((map) => (
          <YourMapRow
            key={map.type}
            map={map}
            highlighted={map.type === highlight}
            settings={layersSettings[map.type]}
            canSave={canSave}
          />
        ))}
      </tbody>
    </Table>
  );
}

type RowProps = {
  map: YourMap;
  highlighted: boolean;
  settings: LayerSettings | undefined;
  canSave: boolean;
};

function YourMapRow({
  map,
  highlighted,
  settings,
  canSave,
}: RowProps): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  // The index entry until the body loads; both carry a switched kind's default.
  const def = useAppSelector((state) => {
    const ref = mapByIdSelector(state)[map.type];

    return ref?.def ?? mapEntryOf(ref);
  });

  const ownOpacity = useAppSelector(
    (state) => state.map.layerSetups[map.type]?.opacity,
  );

  const { type, preset } = map;

  const { deleteCustomMap, deletePreset } = useCustomMapActions();

  const change = (patch: LayerSettings) =>
    dispatch(mapLayerSettingsChange({ type, settings: patch }));

  return (
    <tr className={highlighted ? 'fm-flash' : undefined}>
      {/* The scroll on a ref of its own, stable, so it runs once per mount. */}
      <td ref={highlighted ? scrollIntoCenter : undefined}>
        <LayerKindMark kind={map.layer} />
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
        {canSave && (
          <OpacityButton
            value={
              preset
                ? (preset.opacity ?? 1)
                : resolveLayerOpacity(def, ownOpacity)
            }
            onChange={(opacity) =>
              dispatch(
                preset
                  ? mapPresetChange({ id: preset.id, change: { opacity } })
                  : mapLayerSetupChange({ type, setup: { opacity } }),
              )
            }
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
          {/* A preset is the user's own, shown as it is rather than previewed. */}
          {preset ? (
            <Action
              icon={<FaEye />}
              label={msm?.openPreset}
              onClick={() => {
                dispatch(mapPresetToggle({ id: preset.id, enable: true }));

                dispatch(setActiveModal(null));
              }}
              showFrom="never"
            />
          ) : (
            canPreview(type) && (
              <Action
                icon={<FaEye />}
                label={msm?.preview}
                onClick={() => dispatch(mapLibraryPreviewStart({ type }))}
                showFrom="never"
              />
            )
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

          {(map.kind === 'library' || map.kind === 'custom') &&
            canSwitchKind(map.technology) && (
              <Action
                // The kind it switches to, as `MapLayerItem` marks it.
                icon={
                  LAYER_KIND_ICONS[map.layer === 'base' ? 'overlay' : 'base']
                }
                label={
                  map.layer === 'base' ? msm?.useAsOverlay : msm?.useAsBaseMap
                }
                disabled={!canSave}
                onClick={() =>
                  dispatch(
                    mapLayerSetupChange({
                      type,
                      setup: {
                        kind: map.layer === 'base' ? 'overlay' : 'base',
                      },
                    }),
                  )
                }
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
                  : preset
                    ? deletePreset(preset)
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
