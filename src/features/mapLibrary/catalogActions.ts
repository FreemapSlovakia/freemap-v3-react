import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import type { Dispatch } from 'redux';
import type { CatalogEntry } from './catalog.js';
import { mapLibraryCatalogMapsLoaded } from './model/actions.js';

/**
 * Hands a catalog map to the store before it is shown or installed, so the map
 * reducer knows its kind and the menus its name.
 */
export function makeKnown(dispatch: Dispatch, entry: CatalogEntry): void {
  if (entry.map) {
    dispatch(mapLibraryCatalogMapsLoaded([entry.map]));
  }
}

export function installEntry(dispatch: Dispatch, entry: CatalogEntry): void {
  makeKnown(dispatch, entry);

  dispatch(
    mapLayerSettingsChange({ type: entry.type, settings: { installed: true } }),
  );
}
