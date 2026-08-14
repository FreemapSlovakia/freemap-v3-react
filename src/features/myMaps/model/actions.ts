import type { DataViewerState } from '@features/dataViewer/model/reducer.js';
import type { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import type { GalleryFilter } from '@features/gallery/model/actions.js';
import type { MapState } from '@features/map/model/reducer.js';
import type { RoutePlannerMapData } from '@features/routePlanner/model/reducer.js';
import type { SavedSearchResult } from '@features/search/model/actions.js';
import type { TrackingState } from '@features/tracking/model/reducer.js';
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
  routePlanner?: RoutePlannerMapData;
  galleryFilter?: GalleryFilter;
  trackViewer?: Partial<DataViewerState>;
  map?: Partial<
    Pick<
      MapState,
      'lat' | 'lon' | 'zoom' | 'layers' | 'customLayers' | 'shading'
    >
  >;
  objectsV2?: {
    active: string[];
  };
  search?: {
    results: SavedSearchResult[];
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
  | {
      name?: string;
      writers?: number[];
      asCopy?: boolean;
      /**
       * Flag the map for offline use once it exists. A map being created has no
       * id yet, so it can't be flagged before the save answers with one.
       */
      offline?: boolean;
    }
  | undefined
>('MAPS_SAVE');

export const mapsDelete = createAction<string>('MAPS_DELETE');

export const mapsLoaded = createAction<{
  meta: MapMeta;
  data: MapData;
  merge?: boolean;
}>('MAPS_LOADED');

/**
 * Releases a load that ended without putting a map on screen. Nothing else
 * clears `loadMeta`, so without this the failed map would keep its `id=` in the
 * URL, a repeat navigation to it would be taken for one already in flight, and
 * the working copy of the map that is actually open would stay blocked.
 */
export const mapsLoadFailed = createAction('MAPS_LOAD_FAILED');

export const mapsSetMeta = createAction<MapMeta>('MAPS_SET_META');

/**
 * Brings the meta of the map already open up to date without claiming it, so a
 * load or restore in flight is left to finish. `mapsSetMeta` says "this map is
 * the one now" and releases whatever was opening; this says only "here is a
 * newer answer from the server about it", which is what a save that lands while
 * a read is under way has to say.
 */
export const mapsRefreshMeta = createAction<MapMeta>('MAPS_REFRESH_META');

/**
 * Records the digest of the map as last loaded or saved. Everything about
 * unsaved changes is derived by comparing it with what's on screen — see
 * `mapDirtySelector`.
 */
export const mapsSetSavedFingerprint = createAction<string>(
  'MAPS_SET_SAVED_FINGERPRINT',
);

/**
 * Opens a map named in the URL: continues from the working copy kept in the
 * browser when there is one (so unsaved changes survive a reload), and reads the
 * map from the backend otherwise.
 */
export type MapRestore = {
  mapId: string;
  ignoreMap?: boolean;
  ignoreLayers?: boolean;
  /**
   * Whether the history entry carried this map's content. Without it there is
   * nothing to preserve, so the map is read from the backend even if the browser
   * holds a working copy from an earlier visit in another tab.
   */
  hasRestoredContent: boolean;
  /** `track-uid=` from the URL, deferred so it can't race the restore. */
  trackUID?: string;
  /** `import-url=` from the URL, deferred for the same reason. */
  gpxUrl?: string;
};

export const mapsRestore = createAction<MapRestore>('MAPS_RESTORE');

/**
 * Releases the restore of this map, for the paths that end without opening one.
 * Named, so a save or a load landing meanwhile can't release someone else's.
 */
export const mapsRestoreEnded = createAction<string>('MAPS_RESTORE_ENDED');

/** Ids of maps available offline, synced from IndexedDB. */
export const mapsOfflineIdsLoaded = createAction<string[]>(
  'MAPS_OFFLINE_IDS_LOADED',
);

/**
 * Why a queued save stopped replaying and needs the user to decide: the map
 * moved on (`conflict`), write access was withdrawn (`forbidden`), the map is no
 * longer there (`gone`), or the queued document itself can't be read back
 * (`unreadable`, the one case with nothing left to send or copy).
 */
export type BlockedReason = 'conflict' | 'forbidden' | 'gone' | 'unreadable';

/**
 * What a refused whole-document save means for it, or `undefined` when the
 * answer says nothing about what to do with the save and it is worth retrying.
 * Shared by the direct save and the replay, so the two can't disagree about
 * which refusals the user has to settle.
 */
export function blockedReasonFor(status: number): BlockedReason | undefined {
  return status === 412
    ? 'conflict'
    : status === 403
      ? 'forbidden'
      : status === 404 || status === 410
        ? 'gone'
        : undefined;
}

/** What each reason is explained by, shared by the toast and the badge tooltip. */
export const BLOCKED_MESSAGE_KEYS = {
  conflict: 'outboxConflict',
  forbidden: 'outboxForbidden',
  gone: 'outboxGone',
  unreadable: 'outboxUnreadable',
} as const satisfies Record<BlockedReason, string>;

/** Saving the local version under a new name needs a local version to save. */
export function canCopy(blocked: BlockedReason): boolean {
  return blocked !== 'unreadable';
}

/** Only a map that still exists and still accepts writes can be written over. */
export function canOverwrite(blocked: BlockedReason): boolean {
  return blocked === 'conflict';
}

/**
 * Whether a queued save can stand in for the map when it is read. A save for a
 * map that is gone is not a newer version of anything, and one whose document
 * won't read back has nothing to answer with.
 */
export function canStandInForMap(blocked: BlockedReason | undefined): boolean {
  return blocked !== 'gone' && blocked !== 'unreadable';
}

/** A save waiting to be pushed, as the UI sees it. */
export type OutboxEntry = {
  mapId: string;
  /** The map's name when the save was queued, for toasts about a map not listed. */
  name: string;
  queuedAt: number;
  /** Set when the replay hit something only the user can settle. */
  blocked?: BlockedReason;
};

/** The outbox as it stands in IndexedDB, mirrored for the UI. */
export const mapsOutboxLoaded =
  createAction<OutboxEntry[]>('MAPS_OUTBOX_LOADED');

/** Ids of maps being pushed right now. */
export const mapsOutboxSyncing = createAction<string[]>('MAPS_OUTBOX_SYNCING');

/**
 * Push the queued saves. Fires when the connection returns, once the session is
 * validated at app start, and on an explicit "sync now".
 */
export const mapsSyncOutbox = createAction<{ manual: boolean } | undefined>(
  'MAPS_SYNC_OUTBOX',
);

/**
 * How to settle a queued save the server refused: keep both by saving the local
 * one as a new map, let the local one win, or let the server's win.
 */
export const mapsResolveOutbox = createAction<{
  mapId: string;
  resolution: 'copy' | 'overwrite' | 'discard';
}>('MAPS_RESOLVE_OUTBOX');

/** Flag/unflag a single map for offline use. */
export const mapsSetMapOffline = createAction<{
  id: string;
  offline: boolean;
}>('MAPS_SET_MAP_OFFLINE');

/** Flag/unflag every listed map for offline use. */
export const mapsSetAllOffline = createAction<boolean>('MAPS_SET_ALL_OFFLINE');
