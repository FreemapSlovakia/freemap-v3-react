import type { RootState } from '@app/store/store.js';
import { integratedLayerDefMapSelector } from '@features/mapLibrary/model/selectors.js';
import { resolveLayerOpacity } from '@shared/mapDefinitions.js';
import { mapIndex } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';
import {
  activeCombinations,
  combinationOpacity,
  isCombinable,
  layerKinds,
  type MapCombination,
  type MapCombinationOverlay,
} from './mapCombination.js';

/** Every layer, enough to tell its kind: library, custom and cached alike. */
export const allLayerEntries = (
  customLayers: RootState['map']['customLayers'],
  cachedMaps: RootState['map']['cachedMaps'],
  catalogMaps: RootState['map']['catalogMaps'],
) => [...mapIndex, ...catalogMaps, ...customLayers, ...cachedMaps];

// Beside the shading source it needs, which keeps the stack free of a cycle.
export { resolvedCustomLayersSelector } from '@features/mapLibrary/model/selectors.js';

const layerDefsSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.catalogMaps,
  allLayerEntries,
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
        integratedLayerDefMapSelector(state)[type],
        layerOpacitySetting(state, type),
      ),
    }));

  return { base, overlays };
}
