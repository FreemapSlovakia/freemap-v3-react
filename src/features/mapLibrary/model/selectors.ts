import type { RootState } from '@app/store/store.js';
import { hasRole } from '@features/auth/model/types.js';
import {
  type CachedTileMapDef,
  isCachedMapComplete,
} from '@features/cachedMaps/cachedTileMaps.js';
import {
  canSwitchKind,
  kindOverrides,
  type LayerKind,
  withKind,
} from '@features/map/model/layerKind.js';
import {
  type LayerKinds,
  layerKinds,
  type MapPreset,
  presetIdOf,
  presetKind,
} from '@features/map/model/mapPreset.js';
import { overlayStack } from '@features/map/model/overlayStack.js';
import {
  type CustomLayerDef,
  type IntegratedLayerDef,
  type IsWmsLayerDef,
  isNamedMapDef,
  type LayerDef,
  type MapIndexEntry,
  type NamedMapDef,
} from '@shared/mapDefinitions.js';
import { catalogIndexEntry } from '@shared/mapLibrary/catalogMap.js';
import {
  isLayerInstalled,
  isLayerOffered,
} from '@shared/mapLibrary/installed.js';
import { mapIndex, withBody } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';

// As a string, so other setup changes (an opacity drag) leave it equal.
const kindOverridesKeySelector = createSelector(
  (state: RootState) => state.map.layerSetups,
  (layerSetups) => JSON.stringify(kindOverrides(layerSetups)),
);

/** The maps their setups switch between base map and overlay. */
export const kindOverridesSelector = createSelector(
  kindOverridesKeySelector,
  (key): Readonly<Record<string, LayerKind>> => JSON.parse(key),
);

/** Each map's own kind, before any switch. */
export const nativeKindsSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.catalogMaps,
  (customLayers, cachedMaps, catalogMaps): LayerKinds =>
    layerKinds([...mapIndex, ...catalogMaps, ...customLayers, ...cachedMaps]),
);

/** The account's presets and those a link brought, by id. */
export const presetByIdSelector = createSelector(
  (state: RootState) => state.map.presets,
  (state: RootState) => state.map.linkPresets,
  (presets, linkPresets): Readonly<Record<string, MapPreset>> =>
    Object.fromEntries(
      [...linkPresets, ...presets].map((preset) => [preset.id, preset]),
    ),
);

/** Each preset's kind, by id. */
export const presetKindsSelector = createSelector(
  presetByIdSelector,
  nativeKindsSelector,
  (byId, nativeKinds): Readonly<Record<string, LayerKind>> =>
    Object.fromEntries(
      Object.values(byId).map((preset) => [
        preset.id,
        presetKind(preset, nativeKinds),
      ]),
    ),
);

// As a string first, so the list keeps its identity while only setups change.
const drawnTypesKeySelector = createSelector(
  (state: RootState) => state.map.layers,
  presetByIdSelector,
  (layers, presetById) =>
    JSON.stringify([
      ...new Set(
        layers.flatMap((item) => {
          const id = presetIdOf(item);

          return id === undefined
            ? [item]
            : (presetById[id]?.layers.map((layer) => layer.type) ?? []);
        }),
      ),
    ]),
);

/** The maps drawn, each once, whether on their own or in a preset. */
export const drawnTypesSelector = createSelector(
  drawnTypesKeySelector,
  (key): readonly string[] => JSON.parse(key),
);

/** The built-in maps, then the catalog maps wanted so far, as index rows. */
export const libraryIndexSelector = createSelector(
  (state: RootState) => state.map.catalogMaps,
  kindOverridesSelector,
  (catalogMaps, overrides): MapIndexEntry[] =>
    [...mapIndex, ...catalogMaps.map(catalogIndexEntry)].map((entry) =>
      withKind(entry, overrides),
    ),
);

/** The installed library maps, as Installed maps lists them. */
export const installedLibraryIndexSelector = createSelector(
  libraryIndexSelector,
  (state: RootState) => state.map.layersSettings,
  (state: RootState) => hasRole(state.auth.user, 'layerPreview'),
  (index, layersSettings, canPreview) =>
    index.filter(
      (def) =>
        isLayerInstalled(layersSettings, def.type) &&
        (canPreview || !def.layerPreview),
    ),
);

/** How many maps Installed maps lists: installed ones and the user's own. */
export const yourMapsCountSelector = (state: RootState): number =>
  installedLibraryIndexSelector(state).length +
  state.map.customLayers.length +
  state.map.cachedMaps.filter(isCachedMapComplete).length +
  state.map.presets.length;

/** Every library map whose body is loaded, by id, offered or not. */
export const integratedLayerDefMapSelector = createSelector(
  libraryIndexSelector,
  (state: RootState) => state.mapLibrary.bodies,
  (index, bodies): Readonly<Record<string, IntegratedLayerDef>> =>
    Object.fromEntries(
      index.flatMap((entry) => {
        const body = bodies[entry.type] ?? entry.bundled;

        return body ? [[entry.type, withBody(entry, body)]] : [];
      }),
    ),
);

/**
 * The library maps a list may name — installed, or on the map — in the
 * index's order; one whose body is still loading is left out.
 */
export const integratedLayerDefsSelector = createSelector(
  libraryIndexSelector,
  integratedLayerDefMapSelector,
  (state: RootState) => state.map.layersSettings,
  drawnTypesSelector,
  (index, defs, layersSettings, layers): IntegratedLayerDef[] =>
    index.flatMap(({ type }) =>
      defs[type] && isLayerOffered(layersSettings, layers, type)
        ? [defs[type]]
        : [],
    ),
);

// Partly markers and shapes, in panes above every tile overlay.
const PINNED_TECHNOLOGIES = new Set(['gallery', 'wikipedia', 'interactive']);

/** Whether an overlay of this technology stays on top, out of the reordering. */
const isPinnedOverlay = (technology: string | undefined): boolean =>
  technology !== undefined && PINNED_TECHNOLOGIES.has(technology);

/**
 * A named map as its source draws it, under its own id, name and icon; none
 * while its source's body loads. Typed as a custom map, though it may be a
 * shading or colour map, which every drawing path handles.
 */
export function resolveNamedMap(
  def: NamedMapDef,
  sources: Readonly<Record<string, IntegratedLayerDef | CustomLayerDef>>,
): CustomLayerDef | undefined {
  const source = sources[def.source];

  if (!source || !canSwitchKind(source.technology)) {
    return undefined;
  }

  // What says how the library offers its map is not the named map's.
  const {
    icon: _icon,
    shortcut: _shortcut,
    defaultInMenu: _menu,
    defaultInToolbar: _toolbar,
    superseededBy: _superseded,
    layerPreview: _preview,
    defaultInstalled: _installed,
    ...drawn
  } = source as IntegratedLayerDef & { defaultInstalled?: boolean };

  return { ...drawn, ...def } as CustomLayerDef;
}

// Each stored def's drawn form, while its source and kind are the same: what
// keeps the list below equal as unrelated library bodies load.
const drawnCache = new WeakMap<
  object,
  {
    source: object | undefined;
    kind: LayerKind | undefined;
    drawn: CustomLayerDef;
  }
>();

/** The user's own maps, as drawn: of the kind their setups switch them to. */
export const resolvedCustomLayersSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  integratedLayerDefMapSelector,
  kindOverridesSelector,
  // The form edits the stored kind, the map's default.
  (customLayers, library, overrides): CustomLayerDef[] => {
    // A library map, or one of the user's own servers.
    const sources: Record<string, IntegratedLayerDef | CustomLayerDef> = {
      ...library,
    };

    for (const def of customLayers) {
      if (!isNamedMapDef(def)) {
        sources[def.type] = def;
      }
    }

    return customLayers.flatMap((def) => {
      const source = isNamedMapDef(def) ? sources[def.source] : undefined;

      const kind = overrides[def.type];

      const cached = drawnCache.get(def);

      if (cached && cached.source === source && cached.kind === kind) {
        return [cached.drawn];
      }

      const resolved = isNamedMapDef(def) ? resolveNamedMap(def, sources) : def;

      if (!resolved) {
        return [];
      }

      const drawn = withKind(resolved, overrides);

      drawnCache.set(def, { source, kind, drawn });

      return [drawn];
    });
  },
  {
    // The same maps drawn the same, as one list, so its readers don't re-render.
    memoizeOptions: {
      resultEqualityCheck: (a: CustomLayerDef[], b: CustomLayerDef[]) =>
        a.length === b.length && a.every((def, i) => def === b[i]),
    },
  },
);

/**
 * The named maps, resolved, as the library defs they draw: what credits a
 * source's data under the named map's id. Their source's `attribution` and
 * technology are spread in by `resolveNamedMap`.
 */
export const namedLayerDefsSelector = createSelector(
  resolvedCustomLayersSelector,
  (defs): IntegratedLayerDef[] =>
    defs.filter(
      (def) => def.source !== undefined,
    ) as unknown as IntegratedLayerDef[],
);

/** A map found by id, with what its origin carries. */
export type MapRef =
  | {
      origin: 'library';
      entry: MapIndexEntry;
      /** Once its body loads. */
      def: IntegratedLayerDef | undefined;
    }
  | { origin: 'custom'; def: CustomLayerDef }
  | { origin: 'cached'; def: CachedTileMapDef };

/**
 * Every map by id — a library map first, then a custom one, then an offline
 * one — library and custom maps of the kind their setups switch them to.
 */
export const mapByIdSelector = createSelector(
  libraryIndexSelector,
  integratedLayerDefMapSelector,
  resolvedCustomLayersSelector,
  (state: RootState) => state.map.cachedMaps,
  (index, defs, customLayers, cachedMaps): Readonly<Record<string, MapRef>> => {
    const byId: Record<string, MapRef> = {};

    // Lowest precedence first, so a later origin overwrites.
    for (const def of cachedMaps) {
      byId[def.type] = { origin: 'cached', def };
    }

    for (const def of customLayers) {
      byId[def.type] = { origin: 'custom', def };
    }

    for (const entry of index) {
      byId[entry.type] = { origin: 'library', entry, def: defs[entry.type] };
    }

    return byId;
  },
);

/** What a list names and describes a map by, a library map's body or not. */
export const mapEntryOf = (ref: MapRef | undefined) =>
  ref?.origin === 'library' ? ref.entry : ref?.def;

export type WmsLayerDef = LayerDef<IsWmsLayerDef, IsWmsLayerDef>;

/**
 * The overlays a list may name — installed or on, and the user's own, and the
 * overlay presets on the map — top first: those on the map in their order
 * there, the rest slotted in by their default `zIndex` (see `overlayStack`);
 * and those on the map a drag may move, the pinned ones not.
 */
export const overlayStackSelector = createSelector(
  integratedLayerDefsSelector,
  resolvedCustomLayersSelector,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.layers,
  presetKindsSelector,
  (
    defs,
    customLayers,
    cachedMaps,
    layers,
    presetKinds,
  ): { stack: string[]; movable: ReadonlySet<string> } => {
    const items = [
      ...[...defs, ...customLayers, ...cachedMaps].flatMap((def) =>
        def.layer === 'overlay'
          ? [
              {
                type: def.type,
                zIndex: 'zIndex' in def ? def.zIndex : undefined,
                pinned: isPinnedOverlay(def.technology),
              },
            ]
          : [],
      ),
      ...layers.flatMap((item) => {
        const id = presetIdOf(item);

        return id !== undefined && presetKinds[id] === 'overlay'
          ? [{ type: item, pinned: false }]
          : [];
      }),
    ];

    const onMap = new Set(layers);

    const movable = new Set(
      items
        .filter((item) => !item.pinned && onMap.has(item.type))
        .map((item) => item.type),
    );

    return {
      stack: overlayStack(items, [...layers].reverse()),
      movable,
    };
  },
);

/** Each overlay's z-index on the map: 1 for the bottom one, base maps at 0. */
export const overlayZIndexSelector = createSelector(
  overlayStackSelector,
  ({ stack }): Readonly<Record<string, number>> =>
    Object.fromEntries(stack.map((type, i) => [type, stack.length - i])),
);
