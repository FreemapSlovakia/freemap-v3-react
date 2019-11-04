import { createAction } from 'typesafe-actions';

export const osmLoadNode = createAction('OSM_LOAD_NODE')<number>();

export const osmLoadWay = createAction('OSM_LOAD_WAY')<number>();

export const osmLoadRelation = createAction('OSM_LOAD_RELATION')<number>();

export const osmClear = createAction('OSM_CLEAR')();
