import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { upgradeObjectFilter } from '@osm/taxon.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type KeyColMark,
  type ObjectsResult,
  objectsKeyColShow,
  objectsRouteClear,
  objectsRouteRequest,
  objectsRouteSet,
  objectsSetFilter,
  objectsSetResult,
} from './actions.js';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
  /** The details toast's peak route; `coordinates` is null while it loads. */
  route: { osmId: number; coordinates: [number, number][] | null } | null;
  /** The details toast's key col, marked on the map. */
  keyCol: KeyColMark | null;
}

export const objectInitialState: ObjectsState = {
  objects: [],
  active: [],
  route: null,
  keyCol: null,
};

export const objectsReducer = createReducer(objectInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => objectInitialState)
    .addCase(objectsRouteRequest, (state, { payload }) => {
      state.route = { osmId: payload.osmId, coordinates: null };
    })
    .addCase(objectsRouteSet, (state, { payload }) => {
      if (state.route?.osmId === payload.osmId) {
        state.route.coordinates = payload.coordinates;
      }
    })
    .addCase(objectsRouteClear, (state) => {
      state.route = null;
    })
    .addCase(objectsKeyColShow, (state, { payload }) => {
      state.keyCol = payload;
    })
    .addCase(objectsSetFilter, (state, action) => {
      state.active = [...new Set(action.payload.map(upgradeObjectFilter))];
    })
    .addCase(objectsSetResult, (state, action) => {
      state.objects = action.payload;
    })
    .addCase(mapsLoaded, (state, { payload: { merge, data } }) => {
      const loaded = (data.objectsV2?.active ?? []).map(upgradeObjectFilter);

      state.active = !merge
        ? [...new Set(loaded)]
        : data.objectsV2
          ? [...new Set([...state.active, ...loaded])]
          : state.active;
    }),
);
