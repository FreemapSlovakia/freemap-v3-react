import type { Purchase } from '@features/auth/model/types.js';
import {
  applyCookieConsent,
  setAnalyticCookiesAllowed,
} from '@features/cookieConsent/model/actions.js';
import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { setLocation, toggleLocate } from '@features/location/model/actions.js';
import type { LayerSettings } from '@features/map/model/actions.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import { createAction } from '@reduxjs/toolkit';
import type {
  CustomLayerDef,
  StravaHeatmapColor,
} from '@shared/mapDefinitions.js';
import { OsmFeatureId } from '@shared/types/featureId.js';
import z from 'zod';

export const ToolSchema = z.enum([
  'changesets',
  'draw-lines',
  'draw-points',
  'draw-polygons',
  'map-details',
  'objects',
  'route-planner',
  'track-viewer',
]);

export type Tool = z.infer<typeof ToolSchema>;

const BASIC_MODALS = [
  'about',
  'account',
  'buy-credits',
  'download-map',
  'drawing-properties',
  'embed',
  'export-map',
  'export-map-features',
  'gallery-filter',
  'gallery-upload',
  'gallery-leaderboard',
  'legend',
  'login',
  'map-layers-config',
  'custom-maps',
  'map-preferences',
  'maps',
  'offline-maps',
  'premium',
  'support-us',
  'tracking-my',
  'tracking-watched',
  'upload-track',
] as const;

export const ShowModalSchema = z.enum(BASIC_MODALS);

export const ShowModalCompatSchema = z.preprocess(
  (v) =>
    (typeof v === 'string' &&
      ({
        'export-gpx': 'export-map-features',
        'export-pdf': 'export-map',
        supportUs: 'support-us',
        mapSettings: 'map-layers-config',
        'map-settings': 'map-layers-config',
        'remove-ads': 'premium',
      }[v] as string | undefined)) ||
    v,
  ShowModalSchema,
);

export const ModalSchema = z.enum([
  ...BASIC_MODALS,
  'tips',
  'current-drawing-properties',
]);

export type Modal = z.infer<typeof ModalSchema>;

export type ShowModal = z.infer<typeof ShowModalSchema>;

export const setTool = createAction<Tool | null>('SET_TOOL');

export const setActiveModal = createAction<Modal | null>('SET_ACTIVE_MODAL');

export { setLocation };

export const clearMapFeatures = createAction('CLEAR_MAP_FEATURES');

export { saveHomeLocation, setSelectingHomeLocation, toggleLocate };

export const enableUpdatingUrl = createAction<boolean>('ENABLE_UPDATING_URL');

type Settings = {
  layersSettings?: Record<string, LayerSettings>;
  overlayPaneOpacity?: number;
  customLayers?: CustomLayerDef[];
  drawingColor?: string;
  drawingFillColor?: string;
  drawingWidth?: number;
  drawingDash?: number[];
  drawingLineCap?: 'butt' | 'round' | 'square';
  drawingLineJoin?: 'miter' | 'round' | 'bevel';
  drawingMarkerType?: MarkerType;
  maxZoom?: number;
  stravaHeatmapColor?: StravaHeatmapColor;
};

export const saveSettings = createAction<{
  settings?: Settings;
  user?: {
    name?: string;
    email?: string | null;
    description?: string | null;
    sendGalleryEmails?: boolean;
    picture?: string | null;
  };
  keepOpen?: boolean;
}>('SAVE_SETTINGS');

export const applySettings = createAction<
  Settings & { drawingApplyAll?: boolean }
>('APPLY_SETTINGS');

export const setErrorTicketId = createAction<string | undefined>(
  'SET_ERROR_TICKET_ID',
);

export const setEmbedFeatures = createAction<string[]>('SET_EMBED_FEATURES');

export const purchase = createAction<Purchase>('PURCHASE');

export const deleteFeature = createAction('DELETE_FEATURE');

export interface DrawPointSelection {
  type: 'draw-points';
  id: number;
}

export interface ObjectsSelection {
  type: 'objects';
  id: OsmFeatureId;
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

export interface RouteSegmentSelection {
  type: 'route-leg';
  id: number;
}

export interface SearchSelection {
  type: 'search';
}

export type Selection =
  | LinePointSelection
  | DrawPointSelection
  | ObjectsSelection
  | DrawLinePolySelection
  | TrackingSelection
  | RoutePointSelection
  | RouteSegmentSelection
  | SearchSelection;

export const selectFeature = createAction<Selection | null>('SELECT_FEATURE');

export const convertToDrawing = createAction<
  | ObjectsSelection
  | { type: 'planned-route'; tolerance: number }
  | { type: 'track'; tolerance: number }
  | { type: 'search-result'; tolerance: number }
  | { type: 'changesets' }
>('CONVERT_TO_DRAWING');

export const ExternalTargetSchema = z.enum([
  'copy',
  'f4map',
  'google',
  'hiking.sk',
  'image',
  'josm',
  'mapillary',
  'mapy.com',
  'oma.sk',
  'openstreetcam',
  'osm.org',
  'osm.org/id',
  'peakfinder',
  'url',
  'waze',
  'window',
  'zbgis',
]);

export const openInExternalApp = createAction<{
  where: z.infer<typeof ExternalTargetSchema>;
  lat?: number;
  lon?: number;
  zoom?: number;
  mapType?: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
}>('OPEN_IN_EXTERNAL');

export { applyCookieConsent, setAnalyticCookiesAllowed };

export const hideInfoBar = createAction<{
  key: string;
  ts: number;
}>('HIDE_INFO_BAR');
