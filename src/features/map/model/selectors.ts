import type { RootState } from '@app/store/store.js';
import {
  integratedLayerDefMap,
  integratedLayerDefs,
  resolveLayerOpacity,
  withShadingSource,
} from '@shared/mapDefinitions.js';
import { createSelector } from 'reselect';
import {
  activeCombinations,
  combinationOpacity,
  isCombinable,
  layerKinds,
  type MapCombination,
  type MapCombinationOverlay,
} from './mapCombination.js';

/** Every layer definition: integrated, custom and cached alike. */
export const allLayerDefs = (
  customLayers: RootState['map']['customLayers'],
  cachedMaps: RootState['map']['cachedMaps'],
) => [...integratedLayerDefs, ...customLayers, ...cachedMaps];

/** Whether the user keeps a library map; uninstalling hides it but its links still work. */
export const isLayerInstalled = (
  layersSettings: RootState['map']['layersSettings'],
  type: string,
): boolean => layersSettings[type]?.installed ?? true;

/** Whether a list should offer a library map: installed, or on the map anyway. */
export const isLayerOffered = (
  layersSettings: RootState['map']['layersSettings'],
  layers: readonly string[],
  type: string,
): boolean => isLayerInstalled(layersSettings, type) || layers.includes(type);

/** Custom layers as drawn: a shading map with its source's zooms and limits. */
export const resolvedCustomLayersSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  (customLayers) => customLayers.map(withShadingSource),
);

const layerDefsSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  (state: RootState) => state.map.cachedMaps,
  allLayerDefs,
);

export const layerKindsSelector = createSelector(layerDefsSelector, layerKinds);

/** The active combinations, resolved, in the order they were activated. */
export const activeCombinationsSelector = createSelector(
  (state: RootState) => state.map.mapCombinations,
  (state: RootState) => state.map.layers,
  layerKindsSelector,
  activeCombinations,
);

/** A layer's opacity setting: an active combination's, else the user's own. */
export const opacitySetting = (
  active: readonly MapCombination[],
  layersSettings: RootState['map']['layersSettings'],
  type: string,
): number | undefined =>
  combinationOpacity(active, type) ?? layersSettings[type]?.opacity;

export const layerOpacitySetting = (state: RootState, type: string) =>
  opacitySetting(
    activeCombinationsSelector(state),
    state.map.layersSettings,
    type,
  );

/**
 * What is on the map now, as a combination's layers; `withBase`
 * false leaves the base map out, for a combination laid over any base map.
 */
export function captureCombination(
  state: RootState,
  withBase: boolean,
): Pick<MapCombination, 'base' | 'overlays'> {
  const { layers } = state.map;

  const kinds = layerKindsSelector(state);

  const base = withBase
    ? layers.find((type) => kinds.get(type) === 'base')
    : undefined;

  // Markers are no layer kind, so they fall out here too.
  const overlays: MapCombinationOverlay[] = layers
    .filter((type) => kinds.get(type) === 'overlay' && isCombinable(type))
    .map((type) => ({
      type,
      opacity: resolveLayerOpacity(
        integratedLayerDefMap[type],
        layerOpacitySetting(state, type),
      ),
    }));

  return { base, overlays };
}
