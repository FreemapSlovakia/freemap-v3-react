import { createAction } from '@reduxjs/toolkit';
import {
  type ColorizingMode,
  ColorizingModeSchema,
} from '@shared/colorizers/index.js';
import type { LatLon } from '@shared/types/common.js';
import { FeatureCollection } from 'geojson';

export { type ColorizingMode, ColorizingModeSchema };

export interface TrackPoint extends LatLon {
  startTime?: Date;
  finishTime?: Date;
  length: number;
}

export const trackViewerSetData = createAction<{
  trackGeojson?: FeatureCollection;
  focus?: boolean;
}>('TRACK_VIEWER_SET_TRACK_DATA');

export const trackViewerSetTrackUID = createAction<string | null>(
  'TRACK_VIEWER_SET_TRACK_UID',
);

export const trackViewerDownloadTrack = createAction<string>(
  'TRACK_VIEWER_DOWNLOAD_TRACK',
);

export const trackViewerColorizeTrackBy = createAction<ColorizingMode | null>(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
);

export const trackViewerSetColorizeLegend = createAction<boolean | undefined>(
  'TRACK_VIEWER_SET_COLORIZE_LEGEND',
);

/**
 * Index (into `trackGeojson.features`) of the track the elevation chart, "more
 * info" and the map highlight act on when several are loaded; `null` falls back
 * to the first line. Reset whenever the loaded data changes.
 */
export const trackViewerSetSelectedTrack = createAction<number | null>(
  'TRACK_VIEWER_SET_SELECTED_TRACK',
);

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
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
export const trackViewerSetElevationPrompt =
  createAction<ElevationConsumer | null>('TRACK_VIEWER_SET_ELEVATION_PROMPT');

/**
 * User's answer to the elevation prompt: fill only the gaps, override every
 * point from the server, or keep the track's recorded elevation as-is. Carries
 * the consumer so the processor knows what to do once elevation is settled.
 */
/** How the prompt fills elevation: gaps only, every point, or not at all. */
export type ElevationFillMode = 'missing' | 'all' | 'keep';

export const trackViewerResolveElevationPrompt = createAction<{
  mode: ElevationFillMode;
  consumer: ElevationConsumer;
}>('TRACK_VIEWER_RESOLVE_ELEVATION_PROMPT');

/**
 * Caches server-resolved elevation back into the loaded track. Unlike
 * {@link trackViewerSetData} this is not a fresh load, so it preserves the
 * user's elevation decision for the track.
 */
export const trackViewerSetElevation = createAction<FeatureCollection>(
  'TRACK_VIEWER_SET_ELEVATION',
);

/**
 * Caches a render-only densified copy of the track (extra DEM-sampled points on
 * long segments) for the chart, colorize and details. It is never exported and
 * never treated as the source; it is cleared whenever `trackGeojson` changes.
 */
export const trackViewerSetRenderGeojson = createAction<FeatureCollection>(
  'TRACK_VIEWER_SET_RENDER_GEOJSON',
);

export const trackViewerGpxLoad = createAction<string>('TRACK_VIEWER_GPX_LOAD');

export const trackViewerDelete = createAction('TRACK_VIEWER_DELETE');
