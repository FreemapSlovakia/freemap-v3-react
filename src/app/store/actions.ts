import type { Purchase } from '@features/auth/model/types.js';
import {
  applyCookieConsent,
  setAnalyticCookiesAllowed,
} from '@features/cookieConsent/model/actions.js';
import {
  type Document,
  DocumentSchema,
} from '@features/documents/model/actions.js';
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

const URL_MODAL_IDS = [
  'about',
  'account',
  'credits-purchase',
  'custom-maps',
  'drawing-properties',
  'embed',
  'file-import',
  'gallery-filter',
  'gallery-leaderboard',
  'gallery-upload',
  'legend',
  'login',
  'map-features-export',
  'map-layers-config',
  'map-preferences',
  'map-to-document-export',
  'my-maps',
  'offline-map-export',
  'offline-maps',
  'premium',
  'support-us',
  'tracking-my',
  'tracking-watched',
] as const;

export const UrlModalIdSchema = z.enum(URL_MODAL_IDS);

/** Legacy modal ids (from old shared links) mapped to their current name. */
const MODAL_RENAMES: Record<string, string> = {
  'export-map': 'map-to-document-export',
  'export-gpx': 'map-features-export',
  'export-map-features': 'map-features-export',
  'export-pdf': 'map-to-document-export',
  'download-map': 'offline-map-export',
  supportUs: 'support-us',
  mapSettings: 'map-layers-config',
  'map-settings': 'map-layers-config',
  'remove-ads': 'premium',
  'upload-track': 'file-import',
  'buy-credits': 'credits-purchase',
  maps: 'my-maps',
};

export const ModalIdSchema = z.enum([
  ...URL_MODAL_IDS,
  'current-drawing-properties',
]);

export type ModalId = z.infer<typeof ModalIdSchema>;

/**
 * The open modal/overlay. A discriminated union so a modal can carry an
 * argument (e.g. the document key or watched-device token). At most one is open
 * at a time. `null` means no modal.
 */
export type ActiveModal =
  | { type: Exclude<ModalId, 'tracking-watched'> }
  | { type: 'tracking-watched'; token?: string }
  | { type: 'document'; key: Document }
  | { type: 'gallery-viewer'; id: number }
  | { type: 'wmc'; pageId: number }
  | { type: 'wiki'; key: string };

/**
 * Serializes the open modal to the packed `show=` value (`type` or `type/arg`),
 * or `null` when it has no URL representation. The literal `/` survives because
 * `serializeQuery` un-escapes `%2F`.
 */
export function encodeActiveModal(modal: ActiveModal | null): string | null {
  if (!modal) {
    return null;
  }

  switch (modal.type) {
    case 'tracking-watched':
      return modal.token
        ? `tracking-watched/${modal.token}`
        : 'tracking-watched';
    case 'document':
      return `document/${modal.key}`;
    case 'gallery-viewer':
      return `gallery-viewer/${modal.id}`;
    case 'wmc':
      return `wmc/${modal.pageId}`;
    case 'wiki':
      return `wiki/${modal.key}`;
    default:
      // Only URL-serializable ids go in `show=`; current-drawing-properties doesn't.
      return UrlModalIdSchema.safeParse(modal.type).success ? modal.type : null;
  }
}

/**
 * Parses a packed `show=` value (`type` or `type/arg`) into an `ActiveModal`,
 * applying legacy name renames. Returns `null` when nothing valid is named.
 */
export function decodeShow(raw: string): ActiveModal | null {
  if (!raw) {
    return null;
  }

  const slash = raw.indexOf('/');

  const rawType = slash === -1 ? raw : raw.slice(0, slash);

  const arg = slash === -1 ? undefined : raw.slice(slash + 1);

  const type = MODAL_RENAMES[rawType] ?? rawType;

  switch (type) {
    case 'tracking-watched':
      return arg
        ? { type: 'tracking-watched', token: arg }
        : { type: 'tracking-watched' };
    case 'document': {
      const r = DocumentSchema.safeParse(arg);

      return r.success ? { type: 'document', key: r.data } : null;
    }
    case 'gallery-viewer': {
      const id = Number(arg);

      return arg && Number.isFinite(id) ? { type: 'gallery-viewer', id } : null;
    }
    case 'wmc': {
      const pageId = Number(arg);

      return arg && Number.isFinite(pageId) ? { type: 'wmc', pageId } : null;
    }
    case 'wiki':
      return arg ? { type: 'wiki', key: arg } : null;
    default: {
      const r = UrlModalIdSchema.safeParse(type);

      return r.success ? { type: r.data } : null;
    }
  }
}

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

/**
 * Wraps an arg-less modal named by a `ModalId` into an `ActiveModal`, for the
 * few call sites that open a modal chosen at runtime. The branch on
 * `tracking-watched` is what lets the result narrow into the union — TypeScript
 * can't distribute a `ModalId`-typed discriminant across the union members.
 */
export function modalOf(modalId: ModalId): ActiveModal {
  return modalId === 'tracking-watched'
    ? { type: 'tracking-watched' }
    : { type: modalId };
}

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
