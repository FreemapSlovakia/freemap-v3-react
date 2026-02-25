import { createAction } from '@reduxjs/toolkit';

type Detail = {
  id: number;
  focus: boolean;
  showToast?: boolean;
};

export const osmLoadNode = createAction<Detail>('OSM_LOAD_NODE');

export const osmLoadWay = createAction<Detail>('OSM_LOAD_WAY');

export const osmLoadRelation = createAction<Detail>('OSM_LOAD_RELATION');

export const osmClear = createAction('OSM_CLEAR');
