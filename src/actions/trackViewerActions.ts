import { FeatureCollection, Geometries } from '@turf/helpers';
import { LatLon } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

export type ColorizingMode = 'elevation' | 'steepness';

export interface TrackPoint extends LatLon {
  startTime?: Date;
  finishTime?: Date;
  lengthInKm: number;
}

export const trackViewerSetData = createAction('TRACK_VIEWER_SET_TRACK_DATA')<{
  trackGpx?: string;
  trackGeojson?: FeatureCollection<Geometries>;
  focus?: boolean;
}>();

export const trackViewerSetTrackUID = createAction(
  'TRACK_VIEWER_SET_TRACK_UID',
)<string | null>();

export const trackViewerDownloadTrack = createAction(
  'TRACK_VIEWER_DOWNLOAD_TRACK',
)<string>();

export const trackViewerUploadTrack = createAction(
  'TRACK_VIEWER_UPLOAD_TRACK',
)();

export const trackViewerSetEleSmoothingFactor = createAction(
  'TRACK_VIEWER_SET_ELE_SMOOTHING_FACTOR',
)<number>();

export const trackViewerColorizeTrackBy = createAction(
  'TRACK_VIEWER_COLORIZE_TRACK_BY',
)<ColorizingMode | null>();

export const trackViewerToggleElevationChart = createAction(
  'TRACK_VIEWER_TOGGLE_ELEVATION_CHART',
)();

export const trackViewerGpxLoad = createAction(
  'TRACK_VIEWER_GPX_LOAD',
)<string>();
