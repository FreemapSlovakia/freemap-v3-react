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
import { LayerKindButton } from '@features/mapSettings/components/LayerKindButton.js';
import { OpacityButton } from '@features/mapSettings/components/OpacityButton.js';
import { ToolbarIcon } from '@features/mapSettings/components/ToolbarIcon.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { useCustomMapActions } from '@features/mapSettings/useCustomMapActions.js';
import {
  CUSTOM_MAP_ICONS,
  CustomMapGlyph,
} from '@shared/components/CustomMapGlyph.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LAYER_KIND_ICONS } from '@shared/components/MapLayerItem.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import { useExportPrices } from '@shared/exportPrices.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useRegionNames } from '@shared/hooks/useRegionNames.js';
import { layerLabel, layerName } from '@shared/layerName.js';
import {
  flaggedCountries,
  isNamedMapDef,
  resolveLayerAlias,
  resolveLayerOpacity,
  type StoredCustomLayerDef,
} from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { isExportable } from '@shared/mapLibrary/exportedLayer.js';
import { effectiveShortcut } from '@shared/mapLibrary/installed.js';
import { scrollIntoCenter } from '@shared/scrollIntoCenter.js';
import type { Shortcut } from '@shared/types/common.js';
import type { ReactElement, ReactNode } from 'react';
import { Form, Table } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaBookOpen,
  FaCube,
  FaDownload,
  FaEye,
  FaKeyboard,
  FaPencilAlt,
  FaRegListAlt,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { MdOpacity } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  categoryGroup,
  coversView,
  type ManagerFilters,
  type MapKind,
  type MapShown,
  passes,
  technologyGroup,
} from '../filters.js';
import { prepareSearchTarget, searchLibrary } from '../librarySearch.js';
import { mapLibraryPreviewStart } from '../model/actions.js';
import {
  installedLibraryIndexSelector,
  mapByIdSelector,
  mapEntryOf,
  overlayZIndexSelector,
  presetKindsSelector,
  resolvedCustomLayersSelector,
  userShortcutsSelector,
} from '../model/selectors.js';
import { searchExtras } from '../searchTargets.js';
import {
  type DetailPart,
  MapDetail,
  passesCountry,
  useMapDetail,
} from './FilterChips.js';
import { MapNameLine } from './MapNameLine.js';

/** A map the user has: installed from the library, or their own; or a preset. */
export type YourMap = {
  type: string;
  /** As switched; a preset's by whether it holds a base map. */
  layer: 'base' | 'overlay';
  name: string;
  /** A second line: category and technology, or what a preset holds. */
  detail?: DetailPart[];
  icon: ReactNode;
  countries?: string[];
  /** Where it draws, as `coversView` reads it; none means everywhere. */
  coverage?: {
    countries?: string[];
    bbox?: [number, number, number, number];
    bboxes?: [number, number, number, number][];
  };
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
  icon: '2rem',
  check: '2.5rem',
  kind: '2.25rem',
  opacity: '3rem',
  shortcut: '5rem',
  actions: '4rem',
};

export const KIND_OPTIONS = [
  'builtIn',
  'fromLibrary',
  'custom',
  'offline',
  'presets',
] as const satisfies readonly MapKind[];

export const KIND_ICONS: Record<MapKind, ReactElement> = {
  builtIn: <FaCube />,
  fromLibrary: <FaBookOpen />,
  custom: <FaUser />,
  offline: <BiWifiOff />,
  presets: CUSTOM_MAP_ICONS.preset,
};

const kindOf = (map: YourMap): MapKind =>
  map.kind === 'library'
    ? isCatalogId(map.type)
      ? 'fromLibrary'
      : 'builtIn'
    : map.kind === 'cached'
      ? 'offline'
      : map.kind === 'preset'
        ? 'presets'
        : 'custom';

/**
 * The user's maps that pass the filters (and `highlight` always), in stack
 * order; `queryMatches`: whether the query matches any of them, chips aside.
 */
export function useYourMaps(
  filters: ManagerFilters,
  highlight: string | undefined,
): { rows: YourMap[]; queryMatches: boolean } {
  const m = useMessages();

  const regionNames = useRegionNames();

  const installedIndex = useAppSelector(installedLibraryIndexSelector);

  const mapById = useAppSelector(mapByIdSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const takenShortcuts = useAppSelector(userShortcutsSelector);

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
        coverage: {
          countries: def.countries,
          bbox: def.bbox,
          bboxes: def.bboxes,
        },
        detail: mapDetail(def.category, def.technology),
        legacy: Boolean(def.superseededBy),
        kind: 'library',
        defaultInMenu: Boolean(def.defaultInMenu),
        defaultInToolbar: Boolean(def.defaultInToolbar),
        // As it stands with no setting of its own: yielded where taken.
        defaultShortcut:
          effectiveShortcut({}, def, takenShortcuts) ?? undefined,
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
        detail: [
          ...mapDetail(defOf(cm.sourceType).category, undefined),
          { label: baseName(cm.sourceType) },
        ],
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
        detail:
          preset.layers.length > 0
            ? [
                {
                  label:
                    baseName(preset.layers[0].type) +
                    (preset.layers.length > 1
                      ? ` + ${preset.layers.length - 1}`
                      : ''),
                },
              ]
            : [],
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
  const shownOf = (map: YourMap): MapShown[] => {
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

  const filtered = passes(filters.status, 'installed')
    ? maps.filter(
        (map) =>
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
            )),
      )
    : [];

  // Outside the query's condition, so the compiler keeps it per map list rather
  // than redoing it per keystroke.
  const targets = maps.map((map) =>
    prepareSearchTarget(
      map.name,
      searchExtras(m, regionNames, {
        type: map.type,
        countries: map.coverage?.countries,
        category: map.category,
      }),
    ),
  );

  // Found as the available maps are, though kept in stack order. All maps are
  // searched, so a match hidden only by the chips is known as such.
  const matchedAll = filters.query.trim()
    ? new Set(searchLibrary(maps, targets, filters.query, maps.length).matches)
    : new Set(maps);

  const filteredSet = new Set(filtered);

  const visible = maps.filter(
    (map) =>
      map.type === highlight || (filteredSet.has(map) && matchedAll.has(map)),
  );

  const stackPlace = (map: YourMap) =>
    map.layer === 'base'
      ? 0
      : -(overlayZIndex[map.preset ? presetItem(map.type) : map.type] ?? 0);

  return {
    rows: visible.toSorted(
      (a, b) =>
        (a.layer === 'base' ? 0 : 1) - (b.layer === 'base' ? 0 : 1) ||
        (a.preset ? 0 : 1) - (b.preset ? 0 : 1) ||
        stackPlace(a) - stackPlace(b),
    ),
    queryMatches: matchedAll.size > 0,
  };
}

type TableProps = {
  rows: readonly YourMap[];
  canSave: boolean;
  /** A map to scroll to and flash, as just saved or asked for. */
  highlight?: string;
  /** Over the name column. */
  heading?: ReactNode;
};

/** The maps the user has, each with its settings in columns. */
export function YourMapsTable({
  rows,
  canSave,
  highlight,
  heading,
}: TableProps): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  return (
    <Table striped borderless size="sm" className="align-middle">
      <colgroup>
        <col style={{ width: COLUMN_WIDTHS.icon }} />
      </colgroup>

      <thead>
        <tr>
          {/* No max width lets it truncate instead of widening the table. */}
          <th colSpan={2} className="text-truncate" style={{ maxWidth: 0 }}>
            {heading}
          </th>

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

          <th className="text-center" style={{ width: COLUMN_WIDTHS.kind }}>
            <GlyphMarker hint={m?.mapLayers.layer.layer} color={null}>
              {LAYER_KIND_ICONS.base}
            </GlyphMarker>
          </th>

          {/* The Map layers panel sets it too, so a phone goes without. */}
          <th
            className="text-center d-none d-sm-table-cell"
            style={{ width: COLUMN_WIDTHS.opacity }}
          >
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

  const prices = useExportPrices();

  const downloadable = useAppSelector((state) => {
    const ref = mapByIdSelector(state)[map.type];

    return ref?.origin === 'library' && isExportable(ref.def, prices);
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
      {/* The scroll on a ref of its own, stable, so it runs once per mount.
          At the top, the icon shares the name's line. */}
      <td
        ref={highlighted ? scrollIntoCenter : undefined}
        className="align-top"
      >
        {map.icon}
      </td>

      {/* No max width lets the name truncate instead of widening the table. */}
      <td className="w-100" style={{ maxWidth: 0 }}>
        <MapNameLine
          name={map.name}
          legacy={map.legacy}
          countries={map.countries}
        />

        <MapDetail
          parts={[
            {
              icon: KIND_ICONS[kindOf(map)],
              label: msm?.filters[kindOf(map)] ?? '',
            },
            ...(map.detail ?? []),
          ]}
        />
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
        <LayerKindButton
          value={map.layer}
          onChange={
            canSave &&
            (map.kind === 'library' || map.kind === 'custom') &&
            canSwitchKind(map.technology)
              ? (kind) =>
                  dispatch(mapLayerSetupChange({ type, setup: { kind } }))
              : undefined
          }
        />
      </td>

      <td className="text-center d-none d-sm-table-cell">
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
                      type: 'map-manager',
                      customMap: { edit: type },
                    }),
                  );
                }
              }}
              showFrom="never"
            />
          )}

          {/* Only our own tiles can be downloaded; see `CacheTilesForm`. */}
          {downloadable && (
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
