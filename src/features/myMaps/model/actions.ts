import { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import { GalleryFilter } from '@features/gallery/model/actions.js';
import { MapState } from '@features/map/model/reducer.js';
import { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import { TrackingState } from '@features/tracking/model/reducer.js';
import { TrackViewerState } from '@features/trackViewer/model/reducer.js';
import { createAction } from '@reduxjs/toolkit';

export interface MapMeta {
  id: string;
  name: string;
  public: boolean;
  canWrite: boolean;
  createdAt: Date;
  modifiedAt: Date;
  userId: number;
  writers?: number[];
}

export interface MapData<LT = Line, PT = DrawingPoint> {
  lines?: LT[];
  points?: PT[];
  tracking?: Pick<TrackingState, 'trackedDevices' | 'showLine' | 'showPoints'>;
  routePlanner?: Pick<
    RoutePlannerState,
    | 'transportType'
    | 'points'
    | 'finishOnly'
    | 'pickMode'
    | 'mode'
    | 'milestones'
  >;
  galleryFilter?: GalleryFilter;
  trackViewer?: TrackViewerState;
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
