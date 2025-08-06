import { createAction } from '@reduxjs/toolkit';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { basicModals, tools } from '../constants.js';
import type { CustomLayerDef } from '../mapDefinitions.js';
import type { Purchase } from '../types/auth.js';
import type { LatLon } from '../types/common.js';
import type { LayerSettings } from './mapActions.js';

export type Tool = (typeof tools)[number];

export type Modal =
  | (typeof basicModals)[number]
  | 'tips'
  | 'current-drawing-properties';

export type ShowModal = (typeof basicModals)[number];

export const setTool = createAction<Tool | null>('SET_TOOL');

export const setActiveModal = createAction<Modal | null>('SET_ACTIVE_MODAL');

export const documentShow = createAction<string | null>('DOCUMENT_SHOW');

export const startProgress = createAction<string | number>('START_PROGRESS');

export const stopProgress = createAction<string | number>('STOP_PROGRESS');

export const setLocation = createAction<{
  lat: number;
  lon: number;
  accuracy: number;
}>('SET_LOCATION');

export const LAYERS = [
  'contours',
  'shading',
  'hikingTrails',
  'bicycleTrails',
  'skiTrails',
  'horseTrails',
  'drawing',
  'plannedRoute',
  'track',
] as const;

export type ExportableLayer = (typeof LAYERS)[number];

export type ExportFormat = 'jpeg' | 'png' | 'pdf' | 'svg';

export interface MapExportOptions {
  layers: ExportableLayer[];
  scale: number;
  area: 'visible' | 'selected';
  format: ExportFormat;
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

export const exportMapFeatures = createAction<{
  exportables: Exportable[];
  type: ExportType;
  target: ExportTarget;
  name?: string;
  description?: string;
  activity?: string;
}>('EXPORT_MAP_FEATURES');

export const exportMap = createAction<MapExportOptions>('EXPORT_MAP');

export const clearMapFeatures = createAction('CLEAR_MAP_FEATURES');

export const toggleLocate = createAction<boolean | undefined>('LOCATE');

export const setSelectingHomeLocation = createAction<LatLon | boolean>(
  'SET_SELECTING_HOME_LOCATION',
);

export const saveHomeLocation = createAction('SAVE_HOME_LOCATION');

export const enableUpdatingUrl = createAction('ENABLE_UPDATING_URL');

type Settings = {
  layersSettings?: Record<string, LayerSettings>;
  overlayPaneOpacity?: number;
  customLayers?: CustomLayerDef[];
  drawingColor?: string;
  drawingWidth?: number;
  maxZoom?: number;
};

export const saveSettings = createAction<{
  settings?: Settings;
  user?: {
    name?: string;
    email?: string | null;
    sendGalleryEmails?: boolean;
  };
}>('SAVE_SETTINGS');

export const applySettings = createAction<
  Settings & { drawingApplyAll?: boolean }
>('APPLY_SETTINGS');

export const setErrorTicketId = createAction<string | undefined>(
  'SET_ERROR_TICKET_ID',
);

export const setEmbedFeatures = createAction<string[]>('SET_EMBED_FEATURES');

export const purchaseOnLogin = createAction<Purchase>('PURCHASE_ON_LOGIN');

export const purchase = createAction<Purchase>('PURCHASE');

export const deleteFeature = createAction('DELETE_FEATURE');

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

export interface RoutePointSelection {
  type: 'route-point';
  id: number;
}

export type Selection =
  | LinePointSelection
  | DrawPointSelection
  | ObjectsSelection
  | DrawLinePolySelection
  | TrackingSelection
  | RoutePointSelection;

export const selectFeature = createAction<Selection | null>('SELECT_FEATURE');

export const convertToDrawing = createAction<
  | ObjectsSelection
  | { type: 'planned-route'; tolerance: number }
  | { type: 'track'; tolerance: number }
  | { type: 'search-result'; tolerance: number }
>('CONVERT_TO_DRAWING');

export type ExternalTargets =
  | 'copy'
  | 'f4map'
  | 'google'
  | 'hiking.sk'
  | 'image'
  | 'josm'
  | 'mapillary'
  | 'mapy.com'
  | 'oma.sk'
  | 'openstreetcam'
  | 'osm.org'
  | 'osm.org/id'
  | 'peakfinder'
  | 'url'
  | 'waze'
  | 'window'
  | 'zbgis';

export const openInExternalApp = createAction<{
  where: ExternalTargets;
  lat?: number;
  lon?: number;
  zoom?: number;
  mapType?: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
}>('OPEN_IN_EXTERNAL');

export const applyCookieConsent = createAction('APPLY_COOKIE_CONSENT');

export const setAnalyticCookiesAllowed = createAction<boolean>(
  'SET_ANALYTICS_COOKIES_ALLOWED',
);

export const hideInfoBar = createAction<{
  key: string;
  ts: number;
}>('HIDE_INFO_BAR');

export const downloadMap = createAction<{
  name: string;
  email: string;
  map: string;
  format: string;
  maxZoom: number;
  minZoom: number;
  scale: number;
  boundary: Feature<Polygon | MultiPolygon>;
}>('DOWNLOAD_MAP');
