import type { Purchase } from '@features/auth/model/types.js';
import {
  applyCookieConsent,
  setAnalyticCookiesAllowed,
} from '@features/cookieConsent/model/actions.js';
import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import {
  locationSetHeadingSource,
  locationSetShowBearingLine,
  setLocation,
  toggleLocate,
} from '@features/location/model/actions.js';
import type { LayerSettings } from '@features/map/model/actions.js';
import { createAction } from '@reduxjs/toolkit';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import type { FeatureId, OsmFeatureId } from '@shared/types/featureId.js';
import z from 'zod';
import type { ActiveModal } from './activeModal.js';

export const ToolSchema = z.enum([
  'changesets',
  'draw-lines',
  'draw-points',
  'draw-polygons',
  'gps-recorder',
  'import-file',
  'map-details',
  'objects',
  'route-planner',
  'toposcope',
  'tracking',
]);

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Opens a tool. A map-click tool replaces the open one — at most one of them
 * owns map clicks — and drops the selection unless it owns the selected
 * feature. A tool that only brings a toolbar joins the ones already open and
 * leaves the selection alone.
 */
export const openTool = createAction<Tool>('OPEN_TOOL');

/**
 * Closes one named tool. There is no "close whatever is open": a reducer that
 * clears its slice when its tool goes has to tell that from another tool being
 * opened beside it.
 */
export const closeTool = createAction<Tool>('CLOSE_TOOL');

export const setActiveModal = createAction<ActiveModal | null>(
  'SET_ACTIVE_MODAL',
);

export { setLocation };

export const clearMapFeatures = createAction('CLEAR_MAP_FEATURES');

/** Drops the persisted local settings and reloads the app from defaults. */
export const resetApp = createAction('RESET_APP');

export {
  locationSetHeadingSource,
  locationSetShowBearingLine,
  saveHomeLocation,
  setSelectingHomeLocation,
  toggleLocate,
};

type Settings = {
  layersSettings?: Record<string, LayerSettings>;
  overlayPaneOpacity?: number;
  customLayers?: CustomLayerDef[];
  maxZoom?: number;
  drawing?: Partial<DrawingStyle>;
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
  /**
   * When set, the success toast offers an action to activate (display) the
   * layer of this type, unless it is already active.
   */
  activateLayerType?: string;
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
  /** Which of the shown results this is — the map can hold several at once. */
  id: FeatureId;
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
  // objects: `id` omitted → bulk-convert every visible object as a point
  | { type: 'objects'; id?: OsmFeatureId }
  | { type: 'objects-geometry'; id: OsmFeatureId }
  | { type: 'planned-route'; tolerance: number }
  | { type: 'track'; tolerance: number }
  // tracking: `id` is a watched device's token; omitted converts every one of them
  | { type: 'tracking'; id?: string; tolerance: number }
  | { type: 'search-result'; tolerance: number }
  | { type: 'changesets' }
>('CONVERT_TO_DRAWING');

export type ExternalTarget =
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
  where: ExternalTarget;
  lat?: number;
  lon?: number;
  zoom?: number;
  mapType?: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  /** The page this is about: opened in a window, or shared as a link. */
  url?: string;
  /**
   * The picture itself, for `image` — the one target that shares a file rather than an address, so
   * it needs the bytes and not a page about them. Separate from `url` because the two differ:
   * a Wikimedia photo's `url` is its Commons file page.
   */
  imageUrl?: string;
}>('OPEN_IN_EXTERNAL');

export { applyCookieConsent, setAnalyticCookiesAllowed };

export const hideInfoBar = createAction<{
  key: string;
  ts: number;
}>('HIDE_INFO_BAR');

/** Records that an info bar was displayed, so that the next one gets its turn. */
export const infoBarShown = createAction<{
  key: string;
  ts: number;
}>('INFO_BAR_SHOWN');

export const init = createAction('INIT');
