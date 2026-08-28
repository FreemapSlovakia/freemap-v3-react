import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createAction } from '@reduxjs/toolkit';
import {
  type ColorizingMode,
  ColorizingModeSchema,
} from '@shared/colorizers/index.js';
import type { TransportType } from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { TrackJoinMode } from '../joinTracks.js';
import type { TrackSplitPoint } from '../splitTrack.js';

export { type ColorizingMode, ColorizingModeSchema };

/**
 * The style applied to imported track/line/polygon/point features that carry no
 * style of their own. Independent of the drawing tool's defaults.
 */
export const dataViewerSetStyle = createAction<DrawingStyle>(
  'DATA_VIEWER_SET_STYLE',
);

export interface TrackPoint extends LatLon {
  startTime?: Date;
  finishTime?: Date;
  length: number;
}

export const dataViewerSetData = createAction<{
  trackGeojson?: FeatureCollection;
  focus?: boolean;
  /**
   * Select the loaded data's only line, so it arrives with its own toolbar. Set
   * by the loaders the user reaches for outright (an import, a finished
   * recording, a conversion), not by a link or a reload.
   */
  select?: boolean;
}>('DATA_VIEWER_SET_TRACK_DATA');

export const dataViewerSetTrackUID = createAction<string | null>(
  'DATA_VIEWER_SET_TRACK_UID',
);

/**
 * Puts back the track this browser stored for the current history entry. See
 * `trackStore.ts`: the flag on the entry is what says there is one, and a load
 * that carries no flag evicts the store instead.
 */
export const dataViewerRestoreStored = createAction(
  'DATA_VIEWER_RESTORE_STORED',
);

export const dataViewerDownloadTrack = createAction<string>(
  'DATA_VIEWER_DOWNLOAD_TRACK',
);

export const dataViewerColorizeTrackBy = createAction<ColorizingMode | null>(
  'DATA_VIEWER_COLORIZE_TRACK_BY',
);

export const dataViewerSetColorizeLegend = createAction<boolean | undefined>(
  'DATA_VIEWER_SET_COLORIZE_LEGEND',
);

/**
 * Index (into `trackGeojson.features`) of the track the elevation chart, "more
 * info" and matching act on; `null` falls back to the first line.
 */
export const dataViewerSetActiveTrack = createAction<number | null>(
  'DATA_VIEWER_SET_ACTIVE_TRACK',
);

export const dataViewerToggleElevationChart = createAction(
  'DATA_VIEWER_TOGGLE_ELEVATION_CHART',
);

/**
 * What waits on the elevation fill decision: opening the elevation chart,
 * applying an elevation-derived colorize mode, or showing the track-info toast
 * (its stats depend on elevation). The resolve processor routes to the right
 * consumer once the user has answered.
 */
export type ElevationConsumer =
  | { type: 'chart' }
  | { type: 'colorize'; mode: ColorizingMode }
  | { type: 'info' }
  // The explicit "update elevation" action: fills/overwrites and reports the
  // outcome in a toast. Has no "keep" option (that would just be a cancel).
  | { type: 'update' };

/**
 * Opens the elevation fill/override prompt for the given consumer; `null`
 * closes it.
 */
export const dataViewerSetElevationPrompt =
  createAction<ElevationConsumer | null>('DATA_VIEWER_SET_ELEVATION_PROMPT');

/**
 * User's answer to the elevation prompt: fill only the gaps, override every
 * point from the server, or keep the track's recorded elevation as-is. Carries
 * the consumer so the processor knows what to do once elevation is settled.
 */
/** How the prompt fills elevation: gaps only, every point, or not at all. */
export type ElevationFillMode = 'missing' | 'all' | 'keep';

export const dataViewerResolveElevationPrompt = createAction<{
  mode: ElevationFillMode;
  consumer: ElevationConsumer;
}>('DATA_VIEWER_RESOLVE_ELEVATION_PROMPT');

/**
 * Caches server-resolved elevation back into the loaded track, with the source
 * tokens the API named for it so the chart can credit them later. Unlike
 * {@link dataViewerSetData} this is not a fresh load, so it preserves the
 * user's elevation decision for the track.
 */
export const dataViewerSetElevation = createAction<{
  trackGeojson: FeatureCollection;
  sources: string[];
}>('DATA_VIEWER_SET_ELEVATION');

/**
 * Caches a render-only densified copy of the track (extra DEM-sampled points on
 * long segments) for the chart, colorize and details. It is never exported and
 * never treated as the source; it is cleared whenever `trackGeojson` changes.
 */
export const dataViewerSetRenderGeojson = createAction<FeatureCollection>(
  'DATA_VIEWER_SET_RENDER_GEOJSON',
);

/**
 * Snaps the selected track onto GraphHopper's routing graph, which is what lets
 * a recording be colorized by surface, road type and the rest. The matched line
 * has its own points, so the per-point channels (times, heart rate, cadence)
 * do not survive.
 */
export const dataViewerMatchTrack = createAction<{
  transport: TransportType;
}>('DATA_VIEWER_MATCH_TRACK');

/** Records the source URL without re-fetching, when the track is already here. */
export const dataViewerSetGpxUrl = createAction<string | null>(
  'DATA_VIEWER_SET_GPX_URL',
);

export const dataViewerGpxLoad = createAction<string>('DATA_VIEWER_GPX_LOAD');

export const dataViewerDelete = createAction('DATA_VIEWER_DELETE');

/**
 * Removes one feature (by index into `trackGeojson.features`) from the loaded
 * data; the last one takes the whole collection with it. The remaining data no
 * longer matches the file it came from, so the reducer also drops `trackUID` /
 * `gpxUrl` — the edit is now this browser's own.
 */
export const dataViewerDeleteFeature = createAction<number>(
  'DATA_VIEWER_DELETE_FEATURE',
);

/**
 * Replaces one feature's properties (by index into `trackGeojson.features`) —
 * its name, its own data table and the style it is drawn with. Like
 * {@link dataViewerDeleteFeature} this edits the loaded data, so the result is
 * no longer the file it came from.
 */
export const dataViewerSetFeatureProperties = createAction<{
  index: number;
  properties: GeoJsonProperties;
}>('DATA_VIEWER_SET_FEATURE_PROPERTIES');

/**
 * Arms the split cursor on the selected track: while it is on, the track offers
 * the vertex nearest the pointer to cut at, and a click there cuts it. Disarming
 * takes the cursor with it.
 */
export const dataViewerSetSplitting = createAction<boolean>(
  'DATA_VIEWER_SET_SPLITTING',
);

/**
 * Freezes the armed cursor at a vertex, which is how a finger picks the cut: it
 * has no hover to aim with, so it taps first and confirms from the toolbar.
 */
export const dataViewerSetSplitPoint = createAction<TrackSplitPoint | null>(
  'DATA_VIEWER_SET_SPLIT_POINT',
);

/**
 * Cuts a track in two at one of its vertices, which both halves keep. Like
 * {@link dataViewerDeleteFeature} this edits the loaded data, so the result is
 * no longer the file it came from.
 */
export const dataViewerSplitTrack = createAction<TrackSplitPoint>(
  'DATA_VIEWER_SPLIT_TRACK',
);

/**
 * Arms a join on the given track: while it is on, the next line clicked is
 * joined onto it, `mode` saying whether the two come out as one line or as a
 * segment each. `null` disarms.
 */
export const dataViewerSetJoining = createAction<{
  featureIndex: number;
  mode: TrackJoinMode;
} | null>('DATA_VIEWER_SET_JOINING');

/**
 * Joins the armed track with the one this index names, which the result takes
 * the place of. Like {@link dataViewerSplitTrack} this edits the loaded data,
 * so the result is no longer the file it came from.
 */
export const dataViewerJoinTracks = createAction<number>(
  'DATA_VIEWER_JOIN_TRACKS',
);

/**
 * Breaks a multi-segment recording (a `MultiLineString`, one segment per
 * recording pause) into a feature per segment, by index into
 * `trackGeojson.features`.
 */
export const dataViewerExplodeTrack = createAction<number>(
  'DATA_VIEWER_EXPLODE_TRACK',
);

/**
 * Thins the loaded lines and polygons — the one feature `id` names, or all of
 * them — by the given Douglas–Peucker tolerance, in metres. Like
 * {@link dataViewerSplitTrack} this edits the loaded data in place.
 */
export const dataViewerSimplify = createAction<{
  tolerance: number;
  id?: number;
}>('DATA_VIEWER_SIMPLIFY');
