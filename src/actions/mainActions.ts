import { basicModals, tools } from 'fm3/constants';
import { DocumentKey } from 'fm3/documents';
import { LatLon } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';
import { CustomLayer, LayerSettings } from './mapActions';

export type Tool = (typeof tools)[number];

const specialModals = ['tips', 'edit-label'] as const;

export type Modal =
  | (typeof basicModals)[number]
  | (typeof specialModals)[number];

export type ShowModal = (typeof basicModals)[number];

export const setTool = createAction('SET_TOOL')<Tool | null>();

export const setActiveModal = createAction('SET_ACTIVE_MODAL')<Modal | null>();

export const documentShow = createAction('DOCUMENT_SHOW')<DocumentKey | null>();

export const startProgress = createAction('START_PROGRESS')<string | number>();

export const stopProgress = createAction('STOP_PROGRESS')<string | number>();

export const setLocation = createAction('SET_LOCATION')<{
  lat: number;
  lon: number;
  accuracy: number;
}>();

export interface MapExportOptions {
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

export type Exportable =
  | 'plannedRoute'
  | 'plannedRouteWithStops'
  | 'objects'
  | 'pictures'
  | 'drawingLines'
  | 'drawingAreas'
  | 'drawingPoints'
  | 'tracking'
  | 'gpx'
  | 'search';

export const exportTargets = [
  'download',
  'gdrive',
  'dropbox',
  'garmin',
] as const;

export type ExportTarget = (typeof exportTargets)[number];

export const exportTypes = ['gpx', 'geojson'] as const;

export type ExportType = (typeof exportTypes)[number];

export const exportMapFeatures = createAction('EXPORT_MAP_FEATURES')<{
  exportables: Exportable[];
  type: ExportType;
  target: ExportTarget;
}>();

export const exportMap = createAction('EXPORT_MAP')<MapExportOptions>();

export const clearMapFeatures = createAction('CLEAR_MAP_FEATURES')();

export const toggleLocate = createAction('LOCATE')<boolean | undefined>();

export const setSelectingHomeLocation = createAction(
  'SET_SELECTING_HOME_LOCATION',
)<LatLon | boolean>();

export const saveHomeLocation = createAction('SAVE_HOME_LOCATION')();

export const enableUpdatingUrl = createAction('ENABLE_UPDATING_URL')();

type Settings = {
  layersSettings?: Record<string, LayerSettings>;
  overlayPaneOpacity?: number;
  customLayers?: CustomLayer[];
  drawingColor?: string;
  drawingWidth?: number;
};

export const saveSettings = createAction('SAVE_SETTINGS')<{
  settings?: Settings;
  user?: {
    name: string;
    email: string | null;
    sendGalleryEmails: boolean;
  };
}>();

export const applySettings = createAction('APPLY_SETTINGS')<
  Settings & { drawingApplyAll?: boolean }
>();

export const setErrorTicketId = createAction('SET_ERROR_TICKET_ID')<
  string | undefined
>();

export const setEmbedFeatures = createAction('SET_EMBED_FEATURES')<string[]>();

export const removeAdsOnLogin = createAction('REMOVE_ADS_ON_LOGIN')();

export const removeAds = createAction('REMOVE_ADS')();

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

export interface LinePointSelection {
  type: 'line-point';
  lineIndex: number;
  pointId: number;
}

export interface TrackingSelection {
  type: 'tracking';
  id: string | number;
}

export type Selection =
  | LinePointSelection
  | DrawPointSelection
  | ObjectsSelection
  | DrawLinePolySelection
  | TrackingSelection;

export const selectFeature = createAction('SELECT_FEATURE')<Selection | null>();

export const convertToDrawing = createAction('CONVERT_TO_DRAWING')<
  | ObjectsSelection
  | { type: 'planned-route'; tolerance: number }
  | { type: 'track'; tolerance: number }
  | { type: 'search-result'; tolerance: number }
>();

export type ExternalTargets =
  | 'copy'
  | 'f4map'
  | 'facebook'
  | 'google'
  | 'hiking.sk'
  | 'image'
  | 'josm'
  | 'mapillary'
  | 'mapy.cz'
  | 'oma.sk'
  | 'openstreetcam'
  | 'osm.org'
  | 'osm.org/id'
  | 'peakfinder'
  | 'twitter'
  | 'url'
  | 'waze'
  | 'window'
  | 'zbgis';

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

export const applyCookieConsent = createAction('APPLY_COOKIE_CONSENT')();

export const setAnalyticCookiesAllowed = createAction(
  'SET_ANALYTICS_COOKIES_ALLOWED',
)<boolean>();

export const hideInfoBar = createAction('HIDE_INFO_BAR')<{
  key: string;
  ts: number;
}>();
