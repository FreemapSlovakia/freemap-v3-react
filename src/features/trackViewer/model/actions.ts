import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { FeatureCollection } from 'geojson';
import {
  type ColorizingMode,
  ColorizingModeSchema,
} from '../colorizers/index.js';

export { type ColorizingMode, ColorizingModeSchema };

export interface TrackPoint extends LatLon {
  startTime?: Date;
  finishTime?: Date;
  length: number;
}

export const trackViewerSetData = createAction<{
  trackGpx?: string;
  trackGeojson?: FeatureCollection;
  focus?: boolean;
}>('TRACK_VIEWER_SET_TRACK_DATA');

export const trackViewerSetTrackUID = createAction<string | null>(
  'TRACK_VIEWER_SET_TRACK_UID',
);

export const trackViewerDownloadTrack = createAction<string>(
  'TRACK_VIEWER_DOWNLOAD_TRACK',
);

export const trackViewerUploadTrack = createAction('TRACK_VIEWER_UPLOAD_TRACK');

export const trackViewerColorizeTrackBy = createAction<ColorizingMode | null>(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
);

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
);

/**
 * The elevation consumer waiting on a fill decision. Opens the fill/override
 * prompt; `null` closes it. Currently only the elevation chart triggers it.
 */
export const trackViewerSetElevationPrompt = createAction<'chart' | null>(
  'TRACK_VIEWER_SET_ELEVATION_PROMPT',
);

/** User's answer to the elevation fill prompt: fill gaps or override all. */
export const trackViewerResolveElevationPrompt = createAction<{
  mode: 'missing' | 'all';
}>('TRACK_VIEWER_RESOLVE_ELEVATION_PROMPT');

export const trackViewerGpxLoad = createAction<string>('TRACK_VIEWER_GPX_LOAD');

export const trackViewerDelete = createAction('TRACK_VIEWER_DELETE');
