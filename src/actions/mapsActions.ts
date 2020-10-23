import { createAction } from 'typesafe-actions';
import { Line } from './drawingLineActions';
import { TrackingState } from 'fm3/reducers/trackingReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { ObjectsResult } from './objectsActions';
import { GalleryFilter } from './galleryActions';
import { DrawingPoint } from './drawingPointActions';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { MapState } from 'fm3/reducers/mapReducer';

export interface MapMeta {
  id: number;
  name: string;
  public: boolean;
}

export interface MapData {
  lines?: Line[];
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
  id?: number | undefined;
  ignoreMap?: boolean;
  ignoreLayers?: boolean;
}>();

export const mapsLoadList = createAction('MAPS_LOAD_LIST')();

export const mapsSetList = createAction('MAPS_SET_LIST')<MapMeta[]>();

export const mapsCreate = createAction('MAPS_CREATE')();

export const mapsSave = createAction('MAPS_SAVE')();

export const mapsRename = createAction('MAPS_RENAME')();

export const mapsDataLoaded = createAction('MAPS_DATA_LOADED')<MapData>();
