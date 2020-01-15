import { createAction } from 'typesafe-actions';
import { Line, Point } from './drawingActions';

export type MapMeta = {
  id: number;
  name: string;
  public: boolean;
};

export type MapData = {
  lines: Line[] | undefined;
  points: Point[] | undefined;
};

export const mapsLoad = createAction('MAPS_LOAD')<number | undefined>();

export const mapsLoadList = createAction('MAPS_LOAD_LIST')();

export const mapsSetList = createAction('MAPS_SET_LIST')<MapMeta[]>();

export const mapsCreate = createAction('MAPS_CREATE')();

export const mapsSave = createAction('MAPS_SAVE')();

export const mapsRename = createAction('MAPS_RENAME')();

export const mapsDataLoaded = createAction('MAPS_DATA_LOADED')<MapData>();
