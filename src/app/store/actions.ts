import { basicModals, tools } from '@/constants.js';
import type { CustomLayerDef } from '@/shared/mapDefinitions.js';
import { purchaseOnLogin } from '@features/auth/model/purchaseActions.js';
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
import { createAction } from '@reduxjs/toolkit';
import { OsmFeatureId } from '@shared/types/featureId.js';

export type Tool = (typeof tools)[number];

export type Modal =
  | (typeof basicModals)[number]
  | 'tips'
  | 'current-drawing-properties';

export type ShowModal = (typeof basicModals)[number];

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

export { purchaseOnLogin };

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

export { applyCookieConsent, setAnalyticCookiesAllowed };

export const hideInfoBar = createAction<{
  key: string;
  ts: number;
}>('HIDE_INFO_BAR');
