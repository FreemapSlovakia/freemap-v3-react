import { MapState } from 'fm3/reducers/mapReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { createAction } from 'typesafe-actions';
import { Line } from './drawingLineActions';
import { DrawingPoint } from './drawingPointActions';
import { GalleryFilter } from './galleryActions';

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
    | 'start'
    | 'midpoints'
    | 'finish'
    | 'pickMode'
    | 'mode'
    | 'milestones'
  >;
  galleryFilter?: GalleryFilter;
  trackViewer?: TrackViewerState;
  map?: Partial<
    Pick<
      MapState,
      'mapType' | 'lat' | 'lon' | 'zoom' | 'overlays' | 'customLayers'
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

export const mapsLoad = createAction('MAPS_LOAD')<MapLoadMeta>();

export const mapsDisconnect = createAction('MAPS_DISCONNECT')();

export const mapsLoadList = createAction('MAPS_LOAD_LIST')();

export const mapsSetList = createAction('MAPS_SET_LIST')<MapMeta[]>();

export const mapsSave = createAction('MAPS_SAVE')<
  { name?: string; writers?: number[]; asCopy?: boolean } | undefined
>();

export const mapsDelete = createAction('MAPS_DELETE')<string>();

export const mapsLoaded = createAction('MAPS_LOADED')<{
  meta: MapMeta;
  data: MapData;
  merge?: boolean;
}>();

export const mapsSetMeta = createAction('MAPS_SET_META')<MapMeta>();
