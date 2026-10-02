import type { RootState } from '@app/store/store.js';
import {
  type IntegratedLayerDef,
  type MapIndexEntry,
  SHADING_SOURCE,
} from '@shared/mapDefinitions.js';
import { catalogIndexEntry } from '@shared/mapLibrary/catalogMap.js';
import { isLayerOffered } from '@shared/mapLibrary/installed.js';
import { mapIndex, withBody } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';

/** The built-in maps, then the catalog maps wanted so far, as index rows. */
export const libraryIndexSelector = createSelector(
  (state: RootState) => state.map.catalogMaps,
  (catalogMaps): MapIndexEntry[] => [
    ...mapIndex,
    ...catalogMaps.map(catalogIndexEntry),
  ],
);

export const libraryIndexByIdSelector = createSelector(
  libraryIndexSelector,
  (index): Readonly<Record<string, MapIndexEntry>> =>
    Object.fromEntries(index.map((entry) => [entry.type, entry])),
);

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
