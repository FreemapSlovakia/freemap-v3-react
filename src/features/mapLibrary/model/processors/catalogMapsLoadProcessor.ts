import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { createSelector } from 'reselect';
import { loadCatalogMaps } from '../../catalog.js';
import { mapLibraryCatalogMapsLoaded } from '../actions.js';
import { drawnTypesSelector } from '../selectors.js';

/** Catalog ids wanted but not known, comma-joined: installed, on the map, or an offline map's source. */
const missingCatalogIdsSelector = createSelector(
  (state: RootState) => state.map.layersSettings,
  drawnTypesSelector,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.catalogMaps,
  (layersSettings, layers, cachedMaps, catalogMaps) =>
    [
      ...new Set([
        ...Object.keys(layersSettings).filter(
          (type) => layersSettings[type].installed,
        ),
        ...layers,
        ...cachedMaps.map((cm) => cm.sourceType),
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
        dispatch(mapLibraryCatalogMapsLoaded(maps));
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
