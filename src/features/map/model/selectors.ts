import type { RootState } from '@app/store/store.js';
import {
  integratedLayerDefMap,
  integratedLayerDefs,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import { createSelector } from 'reselect';
import {
  activeCombinations,
  combinationOpacity,
  combinationShading,
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
 * What is on the map now, as a combination's layers and shading; `withBase`
 * false leaves the base map out, for a combination laid over any base map.
 */
export function captureCombination(
  state: RootState,
  withBase: boolean,
): Pick<MapCombination, 'base' | 'overlays' | 'shading'> {
  const { layers, customLayers, shading } = state.map;

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

  return {
    base,
    overlays,
    shading: combinationShading({ base, overlays }, customLayers, shading),
  };
}
