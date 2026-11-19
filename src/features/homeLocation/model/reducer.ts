import { authLogout } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { Place } from '../places.js';
import {
  deletePlace,
  placeStored,
  placesSet,
  savePlace,
  setPickedPlaceName,
  setSelectingHomeLocation,
  startPickingPlace,
} from './actions.js';

export interface HomeLocationState {
  /** The account's places, kept for offline use; negative ids being created. */
  places: Place[];
  /** The picked position while picking a place; `false` when not picking. */
  selectingHomeLocation: LatLon | null | false;
  /** The place being picked; null for a new one. */
  pickingPlace: number | null;
  pickedPlaceName: string;
}

export const homeLocationInitialState: HomeLocationState = {
  places: [],
  selectingHomeLocation: false,
  pickingPlace: null,
  pickedPlaceName: '',
};

export const homeLocationReducer = createReducer(
  homeLocationInitialState,
  (builder) =>
    builder
      .addCase(authLogout, (state) => {
        state.places = [];
      })
      .addCase(startPickingPlace, (state, action) => {
        const place = state.places.find((p) => p.id === action.payload.id);

        state.selectingHomeLocation = place
          ? { lat: place.lat, lon: place.lon }
          : null;

        state.pickingPlace = place?.id ?? null;

        state.pickedPlaceName = place?.name ?? '';
      })
      .addCase(setSelectingHomeLocation, (state, action) => {
        state.selectingHomeLocation = action.payload;
      })
      .addCase(setPickedPlaceName, (state, action) => {
        state.pickedPlaceName = action.payload;
      })
      // TODO a pick of a place deleted meanwhile adds it back.
      .addCase(savePlace, (state, action) => {
        const i = state.places.findIndex((p) => p.id === action.payload.id);

        state.places =
          i === -1
            ? [...state.places, action.payload]
            : state.places.with(i, action.payload);

        state.selectingHomeLocation = false;
      })
      .addCase(deletePlace, (state, action) => {
        state.places = state.places.filter((p) => p.id !== action.payload);
      })
      .addCase(placeStored, (state, action) => {
        const i = state.places.findIndex(
          (p) => p.id === action.payload.localId,
        );

        // Unless deleted meanwhile; only the id, keeping an edit made meanwhile
        // (sent after it).
        if (i !== -1) {
          state.places = state.places.with(i, {
            ...state.places[i]!,
            id: action.payload.place.id,
          });
        }

        // A pick of it begun meanwhile saves under the account's id.
        if (state.pickingPlace === action.payload.localId) {
          state.pickingPlace = action.payload.place.id;
        }
      })
      .addCase(placesSet, (state, action) => {
        state.places = action.payload;
      }),
);
