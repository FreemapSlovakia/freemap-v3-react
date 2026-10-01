import type { RootState } from '@app/store/store.js';
import {
  type IntegratedLayerDef,
  SHADING_SOURCE,
} from '@shared/mapDefinitions.js';
import { isLayerOffered } from '@shared/mapLibrary/installed.js';
import { mapIndex, withBody } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';

/** Every library map whose body is loaded, by id, offered or not. */
export const integratedLayerDefMapSelector = createSelector(
  (state: RootState) => state.mapLibrary.bodies,
  (bodies): Readonly<Record<string, IntegratedLayerDef>> =>
    Object.fromEntries(
      mapIndex.flatMap((entry) => {
        const body = bodies[entry.type];

        return body ? [[entry.type, withBody(entry, body)]] : [];
      }),
    ),
);

/**
 * The library maps a list may name — installed, or on the map — in the
 * index's order; one whose body is still loading is left out.
 */
export const integratedLayerDefsSelector = createSelector(
  integratedLayerDefMapSelector,
  (state: RootState) => state.map.layersSettings,
  (state: RootState) => state.map.layers,
  (defs, layersSettings, layers): IntegratedLayerDef[] =>
    mapIndex.flatMap(({ type }) =>
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
