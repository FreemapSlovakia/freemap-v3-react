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
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { OsmFeatureId } from '@shared/types/featureId.js';
import z from 'zod';
import type { DrawingStyle } from '@/features/drawing/model/reducers/drawingSettingsReducer.js';
import type { ActiveModal } from './activeModal.js';

export const ToolSchema = z.enum([
  'changesets',
  'draw-lines',
  'draw-points',
  'draw-polygons',
  'import-file',
  'map-details',
  'objects',
  'route-planner',
  'tracking',
]);

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Sets a single tool's state, the only action for opening/focusing/closing one:
 * - `open` — show the toolbar, passive (and deactivate it if it was the active
 *   one); doesn't touch other tools or the selection.
 * - `activate` — show + make it the focused/active tool (a map-click tool then
 *   captures clicks); clears the selection (a tool and a selection are exclusive).
 * - `close` — remove it from the open set.
 *
 * The `draw-*` tools share one menu, so opening one replaces the open one.
 */
export type ToolMode = 'open' | 'activate' | 'close';

export const setTool = createAction<{ tool: Tool; mode: ToolMode }>('SET_TOOL');

/** Replaces the whole open-tools set (URL restore; `[]` closes everything). */
export const setTools = createAction<Tool[]>('SET_TOOLS');

export const setActiveModal = createAction<ActiveModal | null>(
  'SET_ACTIVE_MODAL',
);

export { setLocation };

export const clearMapFeatures = createAction('CLEAR_MAP_FEATURES');

export { saveHomeLocation, setSelectingHomeLocation, toggleLocate };

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
  | { type: 'objects-geometry'; id: OsmFeatureId; tolerance: number }
  | { type: 'planned-route'; tolerance: number }
  | { type: 'track'; tolerance: number }
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
  url?: string;
}>('OPEN_IN_EXTERNAL');

export { applyCookieConsent, setAnalyticCookiesAllowed };

export const hideInfoBar = createAction<{
  key: string;
  ts: number;
}>('HIDE_INFO_BAR');

export const init = createAction('INIT');
