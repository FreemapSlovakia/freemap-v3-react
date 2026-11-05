import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import { changesetsInspect } from '@features/changesets/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { upgradeObjectFilter } from '@osm/taxon.js';
import { createReducer } from '@reduxjs/toolkit';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import {
  type ObjectDetailsData,
  type ObjectsResult,
  objectsAwaitSelection,
  objectsRouteClear,
  objectsRouteRequest,
  objectsRouteSet,
  objectsSetDetails,
  objectsSetFilter,
  objectsSetResult,
  objectsTerrainMark,
  type TerrainMark,
  type TerrainMarkKind,
} from './actions.js';

export interface ObjectsState {
  objects: ObjectsResult[];
  active: string[];
  /** The details' peak route; `coordinates` is null while it loads. */
  route: { osmId: number; coordinates: [number, number][] | null } | null;
  /** What the details mark on the map. */
  marks: Partial<Record<TerrainMarkKind, TerrainMark>>;
  details: ObjectDetailsData | null;
  /** A POI a link selects, until the layer has it; any selecting lets go. */
  awaitedSelection: OsmFeatureId | null;
}

export const objectInitialState: ObjectsState = {
  objects: [],
  active: [],
  route: null,
  marks: {},
  details: null,
  awaitedSelection: null,
};

export const objectsReducer = createReducer(objectInitialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => objectInitialState)
    .addCase(objectsAwaitSelection, (state, { payload }) => {
      state.awaitedSelection = payload;
    })
    // Anything selected meanwhile, a search result or an inspection too.
    .addCase(selectFeature, (state) => {
      state.awaitedSelection = null;
    })
    .addCase(searchSelectResult, (state, { payload }) => {
      if (payload && (payload.select ?? true)) {
        state.awaitedSelection = null;
      }
    })
    .addCase(changesetsInspect, (state, { payload }) => {
      if (payload !== null) {
        state.awaitedSelection = null;
      }
    })
    .addCase(objectsSetDetails, (state, { payload }) => {
      state.details = payload;
    })
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
