import type { RootState } from '@app/store/store.js';
import { hasRole } from '@features/auth/model/types.js';
import { isCachedMapComplete } from '@features/cachedMaps/cachedTileMaps.js';
import {
  kindOverrides,
  type LayerKind,
  withKind,
} from '@features/map/model/layerKind.js';
import { overlayStack } from '@features/map/model/overlayStack.js';
import {
  type IntegratedLayerDef,
  type IsWmsLayerDef,
  type LayerDef,
  type MapIndexEntry,
  SHADING_SOURCE,
} from '@shared/mapDefinitions.js';
import { catalogIndexEntry } from '@shared/mapLibrary/catalogMap.js';
import {
  isLayerInstalled,
  isLayerOffered,
} from '@shared/mapLibrary/installed.js';
import { withWmsSource } from '@shared/mapLibrary/linkedWms.js';
import { mapIndex, withBody } from '@shared/mapLibrary/mapIndex.js';
import { withShadingSource } from '@shared/mapLibrary/shadingLayers.js';
import { createSelector } from 'reselect';

// As a string, so other settings changing (an opacity drag) leave it equal.
const kindOverridesKeySelector = createSelector(
  (state: RootState) => state.map.layersSettings,
  (state: RootState) => state.map.linkKinds,
  (layersSettings, linkKinds) =>
    JSON.stringify(kindOverrides(layersSettings, linkKinds)),
);

/** The maps switched between base map and overlay, by a link or the user. */
export const kindOverridesSelector = createSelector(
  kindOverridesKeySelector,
  (key): Readonly<Record<string, LayerKind>> => JSON.parse(key),
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

export const libraryIndexByIdSelector = createSelector(
  libraryIndexSelector,
  (index): Readonly<Record<string, MapIndexEntry>> =>
    Object.fromEntries(index.map((entry) => [entry.type, entry])),
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
  state.map.mapCombinations.length;

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
  (state: RootState) => state.map.layers,
  (index, defs, layersSettings, layers): IntegratedLayerDef[] =>
    index.flatMap(({ type }) =>
      defs[type] && isLayerOffered(layersSettings, layers, type)
        ? [defs[type]]
        : [],
    ),
);

/** The built-in shading layer whose terrain custom shading maps draw. */
export const shadingSourceSelector = (
  state: RootState,
): IntegratedLayerDef | undefined =>
  integratedLayerDefMapSelector(state)[SHADING_SOURCE];

// Partly markers and shapes, in panes above every tile overlay.
const PINNED_TECHNOLOGIES = new Set(['gallery', 'wikipedia', 'interactive']);

/** Whether an overlay of this technology stays on top, out of the reordering. */
export const isPinnedOverlay = (technology: string | undefined): boolean =>
  technology !== undefined && PINNED_TECHNOLOGIES.has(technology);

/** Custom layers as drawn: shading and linked WMS maps with their sources' settings. */
export const resolvedCustomLayersSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  shadingSourceSelector,
  integratedLayerDefMapSelector,
  (customLayers, source, defs) =>
    customLayers.map((def) =>
      withWmsSource(withShadingSource(def, source), defs),
    ),
);

export type WmsLayerDef = LayerDef<IsWmsLayerDef, IsWmsLayerDef>;

/** The WMS maps on the map, library and custom (as drawn), in the map's order. */
export const activeWmsMapsSelector = createSelector(
  integratedLayerDefMapSelector,
  resolvedCustomLayersSelector,
  (state: RootState) => state.map.layers,
  (defs, customLayers, layers): WmsLayerDef[] =>
    layers.flatMap((type) => {
      const def: LayerDef | undefined =
        defs[type] ?? customLayers.find((def) => def.type === type);

      return def?.technology === 'wms' ? [def as WmsLayerDef] : [];
    }),
);

/**
 * The overlays a list may name — installed or on, and the user's own — top
 * first (see `overlayStack`), and those a drag may move: not the pinned ones,
 * nor offline maps, which live on one device while the order is the account's.
 */
export const overlayStackSelector = createSelector(
  integratedLayerDefsSelector,
  resolvedCustomLayersSelector,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.overlayOrder,
  (
    defs,
    customLayers,
    cachedMaps,
    order,
  ): { stack: string[]; movable: ReadonlySet<string> } => {
    const items = [...defs, ...customLayers, ...cachedMaps].flatMap((def) =>
      def.layer === 'overlay'
        ? [
            {
              type: def.type,
              zIndex: 'zIndex' in def ? def.zIndex : undefined,
              pinned: isPinnedOverlay(def.technology),
            },
          ]
        : [],
    );

    const cached = new Set(cachedMaps.map((cm) => cm.type));

    return {
      stack: overlayStack(items, order),
      movable: new Set(
        items
          .filter((item) => !item.pinned && !cached.has(item.type))
          .map((item) => item.type),
      ),
    };
  },
);

/** Each overlay's z-index on the map: 1 for the bottom one, base maps at 0. */
export const overlayZIndexSelector = createSelector(
  overlayStackSelector,
  ({ stack }): Readonly<Record<string, number>> =>
    Object.fromEntries(stack.map((type, i) => [type, stack.length - i])),
);
