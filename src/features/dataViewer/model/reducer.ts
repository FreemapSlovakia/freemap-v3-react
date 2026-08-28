import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { affectsElevationSmoothing } from '@features/elevationChart/model/settingsReducer.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { ELEVATION_SOURCES_PROP } from '@shared/elevation.js';
import { withoutPerPointData } from '@shared/geoutils.js';
import type { FeatureCollection } from 'geojson';
import {
  canJoinTracks,
  joinTrackFeatures,
  type TrackJoinMode,
} from '../joinTracks.js';
import { simplifyDataFeature } from '../simplifyTrack.js';
import {
  explodeTrackFeature,
  splitTrackFeature,
  type TrackSplitPoint,
} from '../splitTrack.js';
import { isTrackLine, type TrackLine } from '../trackSelection.js';
import {
  dataViewerDelete,
  dataViewerDeleteFeature,
  dataViewerDownloadTrack,
  dataViewerExplodeTrack,
  dataViewerGpxLoad,
  dataViewerJoinTracks,
  dataViewerResolveElevationPrompt,
  dataViewerSetActiveTrack,
  dataViewerSetData,
  dataViewerSetElevation,
  dataViewerSetElevationPrompt,
  dataViewerSetFeatureProperties,
  dataViewerSetGpxUrl,
  dataViewerSetJoining,
  dataViewerSetRenderGeojson,
  dataViewerSetSplitPoint,
  dataViewerSetSplitting,
  dataViewerSetTrackUID,
  dataViewerSimplify,
  dataViewerSplitTrack,
  type ElevationConsumer,
  type ElevationFillMode,
} from './actions.js';

export interface DataViewerStateBase {
  trackGeojson: FeatureCollection | null;
  // Render-only densified copy of `trackGeojson` (extra DEM-sampled points on
  // long segments). A cache: `null` means consumers read `trackGeojson`. Never
  // exported; cleared whenever `trackGeojson` changes.
  renderTrackGeojson: FeatureCollection | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface DataViewerState extends DataViewerStateBase {
  elevationPrompt: ElevationConsumer | null;
  // The user's elevation decision for the loaded track: 'undecided' until they
  // answer the prompt (so we don't ask again, and the info panel can report the
  // source), then the chosen fill mode. 'all' means every point now comes from
  // the terrain model, so another server overwrite would be pointless.
  elevationDecision: ElevationDecision;
  // Source tokens the elevation API named for the values it wrote into
  // `trackGeojson` (see `elevationSourcesFromTokens`). Kept because the write
  // happens once, at the prompt, while the chart crediting it can open much
  // later — and a dense recording densifies to nothing, so the render copy alone
  // would name no source. Tracks `elevationDecision`: emptied whenever that is.
  elevationSources: string[];
  // Which line the chart / "more info" / matching act on, by index into
  // `trackGeojson.features`; `null` falls back to the first line. Reset on load.
  // Selecting a line aims it here; deselecting leaves it, so an open chart
  // stays on its track.
  activeTrackIndex: number | null;
  // Whether the split cursor is armed on the selected track.
  splitting: boolean;
  // The vertex the armed cursor is frozen at, which a finger picks before
  // confirming the cut from the toolbar. A pointer that can hover cuts outright
  // and never sets this.
  splitPoint: TrackSplitPoint | null;
  // The track a join is armed on, and how the two are put together; the next
  // line clicked is joined onto it.
  joinWith: { featureIndex: number; mode: TrackJoinMode } | null;
}

export type ElevationDecision = 'undecided' | ElevationFillMode;

export const cleanState: DataViewerStateBase = {
  trackGeojson: null,
  renderTrackGeojson: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const dataViewerInitialState: DataViewerState = {
  elevationPrompt: null,
  elevationDecision: 'undecided',
  elevationSources: [],
  activeTrackIndex: null,
  splitting: false,
  splitPoint: null,
  joinWith: null,
  ...cleanState,
};

/** Both editing modes are armed on one track, so anything else takes them off. */
function clearModes(state: DataViewerState) {
  state.splitting = false;

  state.splitPoint = null;

  state.joinWith = null;
}

/** An edit makes the data no longer the file it came from. */
function markEdited(state: DataViewerState) {
  state.trackUID = null;

  state.gpxUrl = null;
}

/** The same, plus everything derived from the geometry as it was. */
function markGeometryEdited(state: DataViewerState) {
  markEdited(state);

  state.renderTrackGeojson = null;

  clearModes(state);
}

/**
 * Puts the given features in the place of one, shifting whatever a later index
 * names.
 */
function replaceFeature(
  state: DataViewerState,
  index: number,
  replacement: TrackLine[],
) {
  state.trackGeojson?.features.splice(index, 1, ...replacement);

  markGeometryEdited(state);

  const active = state.activeTrackIndex;

  // The first piece keeps the original index, so only what came after moves.
  if (active !== null && active > index) {
    state.activeTrackIndex = active + replacement.length - 1;
  }
}

export const dataViewerReducer = createReducer(
  dataViewerInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => dataViewerInitialState)
      .addCase(dataViewerDelete, () => dataViewerInitialState)
      .addCase(dataViewerSetData, (state, action) => {
        // A new track is a fresh elevation decision.
        if (action.payload.trackGeojson) {
          state.trackGeojson = action.payload.trackGeojson;

          // Invalidate the densified render cache for the new track.
          state.renderTrackGeojson = null;

          state.elevationDecision = 'undecided';

          state.elevationSources = [];

          // The feature indices changed; fall back to the first line.
          state.activeTrackIndex = null;

          clearModes(state);
        }
      })
      .addCase(dataViewerDeleteFeature, (state, { payload }) => {
        const features = state.trackGeojson?.features;

        if (!features?.[payload]) {
          return;
        }

        if (features.length === 1) {
          return dataViewerInitialState;
        }

        const wasActive = state.activeTrackIndex === payload;

        // A delete is a replacement with nothing, but the active line cannot
        // fall through to the piece that took its place — there is none.
        replaceFeature(state, payload, []);

        if (wasActive) {
          state.activeTrackIndex = null;
        }
      })
      .addCase(dataViewerSetFeatureProperties, (state, { payload }) => {
        const feature = state.trackGeojson?.features[payload.index];

        if (!feature) {
          return;
        }

        feature.properties = payload.properties;

        // The densified copy is what gets drawn where it exists, so it needs
        // the new style — but not the properties wholesale: its coordinates are
        // not the recorded ones, and the models its sampling credited are
        // stamped on it alone.
        const rendered = state.renderTrackGeojson?.features[payload.index];

        if (rendered) {
          const sources = rendered.properties?.[ELEVATION_SOURCES_PROP];

          rendered.properties = withoutPerPointData(payload.properties);

          if (sources !== undefined && rendered.properties) {
            rendered.properties[ELEVATION_SOURCES_PROP] = sources;
          }
        }

        markEdited(state);
      })
      .addCase(dataViewerSetElevation, (state, action) => {
        state.trackGeojson = action.payload.trackGeojson;

        state.elevationSources = action.payload.sources;

        // Re-enriched elevation invalidates the densified render cache.
        state.renderTrackGeojson = null;
      })
      .addCase(dataViewerSetRenderGeojson, (state, action) => {
        state.renderTrackGeojson = action.payload;
      })
      .addCase(elevationSetSettings, (state, { payload }) => {
        // The render copy is derived from the smoothing windows, and from
        // nothing else in the slice — the steepness window is read off the
        // drawn points, so dropping the cache for it would resample for nothing.
        if (affectsElevationSmoothing(payload)) {
          state.renderTrackGeojson = null;
        }
      })
      .addCase(dataViewerSetTrackUID, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerDownloadTrack, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerSetActiveTrack, (state, action) => {
        state.activeTrackIndex = action.payload;
      })
      .addCase(dataViewerSetSplitting, (state, { payload }) => {
        clearModes(state);

        state.splitting = payload;
      })
      .addCase(dataViewerSetSplitPoint, (state, { payload }) => {
        state.splitPoint = payload;
      })
      .addCase(dataViewerSetJoining, (state, { payload }) => {
        clearModes(state);

        state.joinWith = payload;
      })
      // The cursor is armed for one track; anything else being selected (or the
      // selection going) leaves it aimed at nothing.
      .addCase(selectFeature, clearModes)
      .addCase(dataViewerSplitTrack, (state, { payload }) => {
        const feature = state.trackGeojson?.features[payload.featureIndex];

        if (!feature || !isTrackLine(feature)) {
          return;
        }

        const halves = splitTrackFeature(
          feature,
          payload.segmentIndex,
          payload.pointIndex,
        );

        if (halves) {
          replaceFeature(state, payload.featureIndex, halves);
        }
      })
      .addCase(dataViewerJoinTracks, (state, { payload }) => {
        const { joinWith } = state;

        const features = state.trackGeojson?.features;

        if (!joinWith || !features) {
          return;
        }

        const target = joinWith.featureIndex;

        if (!canJoinTracks(features, target, payload)) {
          return;
        }

        features[target] = joinTrackFeatures(
          features[target] as TrackLine,
          features[payload] as TrackLine,
          joinWith.mode,
        );

        features.splice(payload, 1);

        markGeometryEdited(state);

        // Unlike a cut, a join mixes two provenances: what was decided for one
        // track says nothing about the other's points, and a model that
        // answered for one must not be credited for both.
        state.elevationDecision = 'undecided';

        state.elevationSources = [];

        // The join lands where the armed track was, minus the one taken out
        // from under it; anything past the removed track moves up.
        const joined = target - (payload < target ? 1 : 0);

        const active = state.activeTrackIndex;

        if (active !== null) {
          state.activeTrackIndex =
            active === target || active === payload
              ? joined
              : active > payload
                ? active - 1
                : active;
        }
      })
      .addCase(dataViewerExplodeTrack, (state, { payload }) => {
        const feature = state.trackGeojson?.features[payload];

        if (!feature || !isTrackLine(feature)) {
          return;
        }

        const parts = explodeTrackFeature(feature);

        if (parts) {
          replaceFeature(state, payload, parts);
        }
      })
      .addCase(dataViewerSimplify, (state, { payload }) => {
        const features = state.trackGeojson?.features;

        if (!features || payload.tolerance <= 0) {
          return;
        }

        let changed = false;

        for (const [index, feature] of features.entries()) {
          if (payload.id !== undefined && payload.id !== index) {
            continue;
          }

          const simplified = simplifyDataFeature(feature, payload.tolerance);

          if (simplified) {
            features[index] = simplified;

            changed = true;
          }
        }

        // Indices are untouched, so the selection and the active line stand.
        if (changed) {
          markGeometryEdited(state);
        }
      })
      .addCase(dataViewerSetElevationPrompt, (state, action) => {
        state.elevationPrompt = action.payload;
      })
      .addCase(dataViewerResolveElevationPrompt, (state, action) => {
        state.elevationPrompt = null;

        state.elevationDecision = action.payload.mode;
      })
      .addCase(dataViewerSetGpxUrl, (state, { payload }) => {
        state.gpxUrl = payload;
      })
      .addCase(dataViewerGpxLoad, (state, action) => {
        state.gpxUrl = action.payload;
      })
      .addCase(
        mapsLoaded,
        (
          _state,
          {
            payload: {
              data: { trackViewer },
            },
          },
        ) => ({ ...dataViewerInitialState, ...trackViewer }),
      ),
);
