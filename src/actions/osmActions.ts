import { createStandardAction, createAction } from 'typesafe-actions';

export const osmLoadNode = createStandardAction('OSM_LOAD_NODE')<number>();

export const osmLoadWay = createStandardAction('OSM_LOAD_WAY')<number>();

export const osmLoadRelation = createStandardAction('OSM_LOAD_RELATION')<
  number
>();

export const osmClear = createAction('OSM_CLEAR');
