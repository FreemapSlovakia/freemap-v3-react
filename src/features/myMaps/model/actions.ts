import type { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import type { GalleryFilter } from '@features/gallery/model/actions.js';
import type { MapState } from '@features/map/model/reducer.js';
import type { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import type { TrackingState } from '@features/tracking/model/reducer.js';
import type { TrackViewerState } from '@features/trackViewer/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';
import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

export const MapMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  public: z.boolean(),
  canWrite: z.boolean(),
  createdAt: IsoDateSchema,
  modifiedAt: IsoDateSchema,
  userId: z.number(),
  writers: z.array(z.number()).optional(),
});

export type MapMeta = z.infer<typeof MapMetaSchema>;

export interface MapData<LT = Line, PT = DrawingPoint> {
  lines?: LT[];
  points?: PT[];
  tracking?: Partial<Pick<TrackingState, 'trackedDevices'>>;
  routePlanner?: Partial<
    Pick<
      RoutePlannerState,
      | 'transportType'
      | 'points'
      | 'finishOnly'
      | 'pickMode'
      | 'mode'
      | 'milestones'
    >
  >;
  galleryFilter?: GalleryFilter;
  trackViewer?: Partial<TrackViewerState>;
  map?: Partial<
    Pick<
      MapState,
      'lat' | 'lon' | 'zoom' | 'layers' | 'customLayers' | 'shading'
    >
  >;
  objectsV2?: {
    active: string[];
  };
}

export type MapLoadMeta = {
  id: string;
  ignoreMap?: boolean;
  ignoreLayers?: boolean;
  merge?: boolean;
};

export const mapsLoad = createAction<MapLoadMeta>('MAPS_LOAD');

export const mapsDisconnect = createAction('MAPS_DISCONNECT');

export const mapsLoadList = createAction('MAPS_LOAD_LIST');

export const mapsSetList = createAction<MapMeta[]>('MAPS_SET_LIST');

export const mapsSave = createAction<
  { name?: string; writers?: number[]; asCopy?: boolean } | undefined
>('MAPS_SAVE');

export const mapsDelete = createAction<string>('MAPS_DELETE');

export const mapsLoaded = createAction<{
  meta: MapMeta;
  data: MapData;
  merge?: boolean;
}>('MAPS_LOADED');

export const mapsSetMeta = createAction<MapMeta>('MAPS_SET_META');

/**
 * Marks the active map's saveable content as diverging from the last
 * loaded/saved state (`true`) or in sync with it (`false`). Drives the unsaved
 * indicator and the reload path that restores local edits instead of re-reading
 * the map from the backend.
 */
export const mapsSetDirty = createAction<boolean>('MAPS_SET_DIRTY');

/**
 * Restores the parts of an unsaved-changes draft that the URL can't carry (see
 * `draftStore`), after a reload of a map with unsaved edits.
 */
export const mapsDraftRestore = createAction<{
  mapId: string;
  /** `track-uid=` from the URL, deferred so it can't race the stash. */
  trackUID?: string;
  /** `import-url=` from the URL, deferred for the same reason. */
  gpxUrl?: string;
}>('MAPS_DRAFT_RESTORE');

/** Ids of maps available offline, synced from IndexedDB. */
export const mapsOfflineIdsLoaded = createAction<string[]>(
  'MAPS_OFFLINE_IDS_LOADED',
);

/** Flag/unflag a single map for offline use. */
export const mapsSetMapOffline = createAction<{
  id: string;
  offline: boolean;
}>('MAPS_SET_MAP_OFFLINE');

/** Flag/unflag every listed map for offline use. */
export const mapsSetAllOffline = createAction<boolean>('MAPS_SET_ALL_OFFLINE');
