import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { Place } from '../places.js';

/** Picks a place's position and name; without an id, a new place. */
export const startPickingPlace = createAction<{ id?: number }>(
  'START_PICKING_PLACE',
);

/** Stages the picked position; `false` ends picking. */
export const setSelectingHomeLocation = createAction<LatLon | false>(
  'SET_SELECTING_HOME_LOCATION',
);

export const setPickedPlaceName = createAction<string>('SET_PICKED_PLACE_NAME');

/** Adds the place (a negative id) or changes the one with its id. */
export const savePlace = createAction<Place>('SAVE_PLACE');

export const deletePlace = createAction<number>('DELETE_PLACE');

/** The account's version of a place saved under `localId`. */
export const placeStored = createAction<{ localId: number; place: Place }>(
  'PLACE_STORED',
);

export const placesLoad = createAction('PLACES_LOAD');

/** The account's places. */
export const placesSet = createAction<Place[]>('PLACES_SET');
