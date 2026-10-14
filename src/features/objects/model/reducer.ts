import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { upgradeObjectFilter } from '@osm/taxon.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type ObjectsResult,
  objectsRouteClear,
  objectsRouteRequest,
  objectsRouteSet,
  objectsSetFilter,
  objectsSetResult,
  objectsTerrainMark,
  type TerrainMark,
  type TerrainMarkKind,
} from './actions.js';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
  /** The details toast's peak route; `coordinates` is null while it loads. */
  route: { osmId: number; coordinates: [number, number][] | null } | null;
  /** What the details toast marks on the map. */
  marks: Partial<Record<TerrainMarkKind, TerrainMark>>;
}

export const objectInitialState: ObjectsState = {
  objects: [],
  active: [],
  route: null,
  marks: {},
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
    .addCase(objectsTerrainMark, (state, { payload: { kind, mark } }) => {
      if (mark) {
        state.marks[kind] = mark;
      } else {
        delete state.marks[kind];
      }
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
