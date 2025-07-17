import { createAction } from '@reduxjs/toolkit';
import { MapState } from '../reducers/mapReducer.js';
import { RoutePlannerState } from '../reducers/routePlannerReducer.js';
import { TrackingState } from '../reducers/trackingReducer.js';
import { TrackViewerState } from '../reducers/trackViewerReducer.js';
import { Line } from './drawingLineActions.js';
import { DrawingPoint } from './drawingPointActions.js';
import { GalleryFilter } from './galleryActions.js';

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
      | 'mapType'
      | 'lat'
      | 'lon'
      | 'zoom'
      | 'overlays'
      | 'customLayers'
      | 'shading'
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
