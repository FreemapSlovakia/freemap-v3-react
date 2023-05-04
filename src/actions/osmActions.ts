import { createAction } from 'typesafe-actions';

type Detail = {
  id: number;
  focus: boolean;
  showToast?: boolean;
};

export const osmLoadNode = createAction('OSM_LOAD_NODE')<Detail>();

export const osmLoadWay = createAction('OSM_LOAD_WAY')<Detail>();

export const osmLoadRelation = createAction('OSM_LOAD_RELATION')<Detail>();

export const osmClear = createAction('OSM_CLEAR')();
