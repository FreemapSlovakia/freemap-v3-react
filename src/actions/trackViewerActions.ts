import { createStandardAction, createAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';

export type ColorizingMode = 'elevation' | 'steepness';

export const trackViewerSetData = createStandardAction(
  'TRACK_VIEWER_SET_TRACK_DATA',
)<{
  trackGpx: object;
  trackGeojson: object;
  startPoints: LatLon[];
  finishPoints: LatLon[];
}>();

export const trackViewerSetTrackUID = createStandardAction(
  'TRACK_VIEWER_SET_TRACK_UID',
)<string>();

export const trackViewerDownloadTrack = createStandardAction(
  'TRACK_VIEWER_DOWNLOAD_TRACK',
)<string>();

export const trackViewerUploadTrack = createAction('TRACK_VIEWER_UPLOAD_TRACK');

export const trackViewerSetEleSmoothingFactor = createStandardAction(
  'TRACK_VIEWER_SET_ELE_SMOOTHING_FACTOR',
)<number>();

export const trackViewerLoadState = createStandardAction(
  'TRACK_VIEWER_LOAD_STATE',
)<{
  eleSmoothingFactor?: number;
}>();

export const trackViewerColorizeTrackBy = createStandardAction(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
)<ColorizingMode | null>();

export const trackViewerShowInfo = createAction('TRACK_VIEWER_SHOW_INFO');

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
);

export const trackViewerGpxLoad = createStandardAction('TRACK_VIEWER_GPX_LOAD')<
  string
>();
