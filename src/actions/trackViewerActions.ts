import { createStandardAction, createAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';
import { FeatureCollection } from 'geojson';

export type ColorizingMode = 'elevation' | 'steepness';

export interface ITrackPoint extends LatLon {
  startTime?: Date;
  finishTime?: Date;
  lengthInKm: number;
}

export const trackViewerSetData = createStandardAction(
  'TRACK_VIEWER_SET_TRACK_DATA',
)<{
  trackGpx?: string;
  trackGeojson?: FeatureCollection;
  startPoints?: ITrackPoint[];
  finishPoints?: ITrackPoint[];
}>();

export const trackViewerSetTrackUID = createStandardAction(
  'TRACK_VIEWER_SET_TRACK_UID',
)<string | null>();

export const trackViewerDownloadTrack = createStandardAction(
  'TRACK_VIEWER_DOWNLOAD_TRACK',
)<string>();

export const trackViewerUploadTrack = createAction('TRACK_VIEWER_UPLOAD_TRACK');

export const trackViewerSetEleSmoothingFactor = createStandardAction(
  'TRACK_VIEWER_SET_ELE_SMOOTHING_FACTOR',
)<number>();

export const trackViewerColorizeTrackBy = createStandardAction(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
)<ColorizingMode | null>();

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
);

export const trackViewerGpxLoad = createStandardAction('TRACK_VIEWER_GPX_LOAD')<
  string
>();
