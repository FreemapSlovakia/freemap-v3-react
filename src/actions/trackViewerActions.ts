import { createStandardAction, createAction } from 'typesafe-actions';

export const trackViewerSetData = createStandardAction(
  'TRACK_VIEWER_SET_TRACK_DATA',
)<any>();

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
)<object>();

export const trackViewerColorizeTrackBy = createStandardAction(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
)<'elevation' | 'steepness'>();

export const trackViewerShowInfo = createAction('TRACK_VIEWER_SHOW_INFO');

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
);

export const trackViewerGpxLoad = createStandardAction('TRACK_VIEWER_GPX_LOAD')<
  string
>();
