import { AppState, LatLon } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';

export type Tool =
  | 'objects'
  | 'route-planner'
  | 'draw-lines'
  | 'draw-polygons'
  | 'route-planner'
  | 'track-viewer'
  | 'draw-points'
  | 'changesets'
  | 'map-details'
  | 'maps';

export const setTool = createAction('SET_TOOL')<Tool | null>();

export const setActiveModal = createAction('SET_ACTIVE_MODAL')<string | null>();

export const setHomeLocation = createAction('SET_HOME_LOCATION')<{
  lat: number;
  lon: number;
} | null>();

export const startProgress = createAction('START_PROGRESS')<string | number>();

export const stopProgress = createAction('STOP_PROGRESS')<string | number>();

export const setLocation = createAction('SET_LOCATION')<{
  lat: number;
  lon: number;
  accuracy: number;
}>();

export interface PdfExportOptions {
  contours: boolean;
  shadedRelief: boolean;
  hikingTrails: boolean;
  bicycleTrails: boolean;
  skiTrails: boolean;
  horseTrails: boolean;
  drawing: boolean;
  plannedRoute: boolean;
  track: boolean;
  scale: number;
  area: 'visible' | 'selected';
  format: 'png' | 'jpeg' | 'svg' | 'pdf';
  style: string;
}

export type Destination = 'download' | 'gdrive' | 'dropbox';

export const setExpertMode = createAction('SET_EXPERT_MODE')<boolean>();

export const setAppState = createAction('SET_APP_STATE')<AppState>();

export const exportGpx = createAction('EXPORT_GPX')<{
  exportables: string[];
  destination: Destination;
}>();

export const exportPdf = createAction('EXPORT_PDF')<PdfExportOptions>();

export const clearMap = createAction('CLEAR_MAP')();

export const toggleLocate = createAction('LOCATE')();

export const setSelectingHomeLocation = createAction(
  'SET_SELECTING_HOME_LOCATION',
)<boolean>();

export const enableUpdatingUrl = createAction('ENABLE_UPDATING_URL')();

export const saveSettings = createAction('SAVE_SETTINGS')<{
  homeLocation: LatLon | null;
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
  expertMode: boolean;
  trackViewerEleSmoothingFactor: number;
  user: { name: string | null; email: string | null } | null;
  preventTips: boolean;
}>();

export const setErrorTicketId = createAction('SET_ERROR_TICKET_ID')<
  string | undefined
>();

export const setEmbedFeatures = createAction('SET_EMBED_FEATURES')<string[]>();

export const deleteFeature = createAction('DELETE_FEATURE')();

export interface DrawPointSelection {
  type: 'draw-points';
  id: number;
}

export interface ObjectsSelection {
  type: 'objects';
  id: number;
}

export interface DrawLinePolySelection {
  type: 'draw-line-poly';
  id: number;
}

export interface TrackingSelection {
  type: 'tracking';
  id: string | number;
}

export type Selection =
  | DrawPointSelection
  | ObjectsSelection
  | DrawLinePolySelection
  | TrackingSelection;

export const selectFeature = createAction('SELECT_FEATURE')<Selection | null>();

export const convertToDrawing = createAction('CONVERT_TO_DRAWING')<
  number | undefined
>();

export type ExternalTargets =
  | 'window'
  | 'facebook'
  | 'twitter'
  | 'copy'
  | 'osm.org'
  | 'osm.org/id'
  | 'josm'
  | 'zbgis'
  | 'hiking.sk'
  | 'google'
  | 'mapy.cz'
  | 'oma.sk'
  | 'openstreetcam'
  | 'mapillary'
  | 'url'
  | 'image';

export const openInExternalApp = createAction('OPEN_IN_EXTERNAL')<{
  where: ExternalTargets;
  lat?: number;
  lon?: number;
  zoom?: number;
  mapType?: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
}>();
