import {
  type DrawingStyle,
  makeDrawingStyle,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import {
  type RecentSearch,
  type SearchSource,
  searchRecentAdd,
  searchRecentRemove,
  searchSetLabelSettings,
  searchSetResultStyle,
} from './actions.js';

// Style for displayed search / map-details geometry. A dedicated, persisted
// settings slice (not the transient results), so it survives map clears.
// `window.fmHeadless.searchResultStyle` still takes precedence in the headless
// render.
export interface SearchSettingsState {
  resultStyle: DrawingStyle;
  labelVisibility: LabelVisibility;
  labelMinZoom: number | null;
  /** Results picked from the box, newest first. */
  recent: RecentSearch[];
}

export const searchSettingsInitialState: SearchSettingsState = {
  resultStyle: makeDrawingStyle('#3388ff', 5),
  labelVisibility: 'hover',
  labelMinZoom: null,
  recent: [],
};

const maxRecentSearches = 8;

// Sources whose results stay small: a geocoding hit is a centroid, its outline
// fetched again when picked. Pasted GeoJSON and WMS features can be any size.
const recentSources = new Set<SearchSource>([
  'nominatim-forward',
  'coords',
  'bbox',
  'tile',
]);

// Coordinates, a bbox or a tile get a new synthetic id on every search, so
// only an OSM element is matched by its id.
function sameRecent(a: RecentSearch, b: RecentSearch): boolean {
  return a.id.type === 'osm' || b.id.type === 'osm'
    ? featureIdsEqual(a.id, b.id)
    : a.source === b.source &&
        JSON.stringify(a.geojson) === JSON.stringify(b.geojson);
}

export const searchSettingsReducer = createReducer(
  searchSettingsInitialState,
  (builder) =>
    builder
      .addCase(searchSetResultStyle, (state, action) => {
        state.resultStyle = action.payload;
      })
      .addCase(searchSetLabelSettings, (state, { payload }) => {
        state.labelVisibility = payload.visibility;
        state.labelMinZoom = payload.minZoom;
      })
      .addCase(searchRecentAdd, (state, { payload }) => {
        if (!recentSources.has(payload.source)) {
          return;
        }

        const { loading: _loading, ...result } = payload;

        state.recent = [
          result,
          ...state.recent.filter((item) => !sameRecent(item, result)),
        ].slice(0, maxRecentSearches);
      })
      .addCase(searchRecentRemove, (state, { payload }) => {
        state.recent = state.recent.filter(
          (item) => !featureIdsEqual(item.id, payload),
        );
      }),
);
