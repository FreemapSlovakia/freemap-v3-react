import { createAction } from 'typesafe-actions';

export const osmLoadNode = createAction('OSM_LOAD_NODE')<{
  id: number;
  focus: boolean;
}>();

export const osmLoadWay = createAction('OSM_LOAD_WAY')<{
  id: number;
  focus: boolean;
}>();

export const osmLoadRelation = createAction('OSM_LOAD_RELATION')<{
  id: number;
  focus: boolean;
}>();

export const osmClear = createAction('OSM_CLEAR')();
