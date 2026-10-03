import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { layerKindsSelector } from '@features/map/model/selectors.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from '@reduxjs/toolkit';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { wmsSources } from '@shared/mapLibrary/linkedWms.js';
import { createSelector } from 'reselect';
import { loadCatalogMaps } from '../../catalog.js';
import {
  isUnresolvedCatalogId,
  lackedCatalogIds,
} from '../../catalogResolution.js';
import { mapLibraryCatalogMapsLoaded } from '../actions.js';
import { kindOverridesSelector } from '../selectors.js';

/**
 * Catalog ids wanted but not known, comma-joined: installed, on the map, or an
 * offline map's or linked WMS map's source.
 */
const missingCatalogIdsSelector = createSelector(
  (state: RootState) => state.map.layersSettings,
  (state: RootState) => state.map.layers,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.customLayers,
  (state: RootState) => state.map.catalogMaps,
  (layersSettings, layers, cachedMaps, customLayers, catalogMaps) =>
    [
      ...new Set([
        ...Object.keys(layersSettings).filter(
          (type) => layersSettings[type].installed,
        ),
        ...layers,
        ...cachedMaps.map((cm) => cm.sourceType),
        ...wmsSources(customLayers),
      ]),
    ]
      .filter(
        (type) =>
          isCatalogId(type) && !catalogMaps.some((map) => map.type === type),
      )
      .sort()
      .join(','),
);

/** Asked for already; an id the catalog lacks isn't asked for again. */
const asked = new Set<string>();

/**
 * A link naming only catalog maps gets no base map while their kinds are
 * unknown; once none can still turn out a base, the default one goes under.
 * A map switched to an overlay leaves none on purpose.
 */
function ensureBase(getState: () => RootState, dispatch: Dispatch) {
  const { layers } = getState().map;

  const kinds = layerKindsSelector(getState());

  const overrides = kindOverridesSelector(getState());

  if (
    layers.some(isCatalogId) &&
    !layers.some(
      (type) =>
        kinds.get(type) === 'base' ||
        isUnresolvedCatalogId(type, kinds) ||
        overrides[type] === 'overlay',
    )
  ) {
    dispatch(mapToggleLayer({ type: 'X', enable: true }));
  }
}

/** Covers a link to catalog maps already known or found missing, which loads nothing. */
export const catalogBaseProcessor: Processor = {
  stateChangePredicate: (state) => state.map.layers,
  handle({ getState, dispatch }) {
    ensureBase(getState, dispatch);
  },
};

export const catalogMapsLoadProcessor: Processor = {
  actionCreator: init,
  stateChangePredicate: missingCatalogIdsSelector,
  predicatesOperation: 'OR',
  handle({ getState, dispatch }) {
    const missing = missingCatalogIdsSelector(getState());

    const types = missing
      ? missing.split(',').filter((type) => !asked.has(type))
      : [];

    if (!types.length) {
      return;
    }

    for (const type of types) {
      asked.add(type);
    }

    // Not awaited: loading the catalog is no reason for the progress spinner.
    void loadCatalogMaps(types).then(
      (maps) => {
        for (const type of types) {
          if (!maps.some((map) => map.type === type)) {
            lackedCatalogIds.add(type);
          }
        }

        dispatch(mapLibraryCatalogMapsLoaded(maps));

        ensureBase(getState, dispatch);
      },
      (err: unknown) => {
        for (const type of types) {
          asked.delete(type);
        }

        dispatch(
          toastsAdd({
            id: 'mapLibrary.catalogError',
            messageKey: 'general.loadError',
            messageParams: { err },
            style: 'danger',
          }),
        );
      },
    );
  },
};
