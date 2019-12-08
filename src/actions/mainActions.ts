import { createAction } from 'typesafe-actions';
import { LatLon, AppState } from 'fm3/types/common';

export type Tool =
  | 'objects'
  | 'route-planner'
  | 'measure-dist'
  | 'measure-ele'
  | 'measure-area'
  | 'route-planner'
  | 'track-viewer'
  | 'info-point'
  | 'changesets'
  | 'gallery'
  | 'map-details'
  | 'tracking';

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
  scale: number;
  area: 'visible' | 'infopoints';
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

export const reloadApp = createAction('RELOAD_APP')();

export const saveSettings = createAction('SAVE_SETTINGS')<{
  tileFormat: 'png' | 'jpeg';
  homeLocation: LatLon | null;
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
  expertMode: boolean;
  trackViewerEleSmoothingFactor: number;
  user: { name: string | null; email: string | null } | null;
  preventTips: boolean;
}>();

export const setErrorTicketId = createAction('SET_ERROR_TICKET_ID')<string>();

export const setEmbedFeatures = createAction('SET_EMBED_FEATURES')<string[]>();

export const deleteFeature = createAction('DELETE_FEATURE')<
  undefined,
  | undefined
  | {
      selection?: Selection | null;
    }
>();

export interface InfoPointSelection {
  type: 'info-point';
  index?: number;
}

export interface DistanceMeasurementSelection {
  type: 'measure-dist';
  index?: number;
}

export interface ObjectsSelection {
  type: 'objects';
  id?: number;
}

export interface OtherSelection {
  type:
    | 'map-details'
    | 'track-viewer'
    | 'changesets'
    | 'gallery'
    | 'tracking'
    | 'route-planner'
    | 'measure-ele'
    | 'measure-area';
}

export type Selection =
  | InfoPointSelection
  | DistanceMeasurementSelection
  | ObjectsSelection
  | OtherSelection;

export const selectFeature = createAction('SELECT_FEATURE')<Selection | null>();
