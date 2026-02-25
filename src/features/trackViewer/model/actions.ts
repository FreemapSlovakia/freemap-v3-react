import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import { FeatureCollection } from 'geojson';

export type ColorizingMode = 'elevation' | 'steepness';

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

export const trackViewerGpxLoad = createAction<string>('TRACK_VIEWER_GPX_LOAD');

export const trackViewerDelete = createAction('TRACK_VIEWER_DELETE');
