import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createAction } from '@reduxjs/toolkit';
import {
  type ColorizingMode,
  ColorizingModeSchema,
} from '@shared/colorizers/index.js';
import type { LatLon } from '@shared/types/common.js';
import type { FeatureCollection } from 'geojson';

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
 * info" and the map highlight act on when several are loaded; `null` falls back
 * to the first line. Reset whenever the loaded data changes.
 */
export const dataViewerSetSelectedTrack = createAction<number | null>(
  'DATA_VIEWER_SET_SELECTED_TRACK',
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

/** Records the source URL without re-fetching, when the track is already here. */
export const dataViewerSetGpxUrl = createAction<string | null>(
  'DATA_VIEWER_SET_GPX_URL',
);

export const dataViewerGpxLoad = createAction<string>('DATA_VIEWER_GPX_LOAD');

export const dataViewerDelete = createAction('DATA_VIEWER_DELETE');
