import { MapState } from 'fm3/reducers/mapReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { createAction } from 'typesafe-actions';
import { Line } from './drawingLineActions';
import { DrawingPoint } from './drawingPointActions';
import { GalleryFilter } from './galleryActions';
import { ObjectsResult } from './objectsActions';

export interface MapMeta {
  id: string;
  name: string;
  public: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface MapData<LT = Line> {
  lines?: LT[];
  points?: DrawingPoint[];
  objects?: ObjectsResult[];
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
    Pick<MapState, 'mapType' | 'lat' | 'lon' | 'zoom' | 'overlays'>
  >;
}

export const mapsLoad = createAction('MAPS_LOAD')<{
  id?: string | undefined;
  ignoreMap?: boolean;
  ignoreLayers?: boolean;
  merge?: boolean;
}>();

export const mapsLoadList = createAction('MAPS_LOAD_LIST')();

export const mapsSetList = createAction('MAPS_SET_LIST')<MapMeta[]>();

export const mapsSave = createAction('MAPS_SAVE')<
  { name: string; asCopy?: boolean } | undefined
>();

export const mapsDelete = createAction('MAPS_DELETE')<string | undefined>();

export const mapsRename = createAction('MAPS_RENAME')();

export const mapsDataLoaded = createAction('MAPS_DATA_LOADED')<
  MapData & { merge?: boolean; name: string }
>();
