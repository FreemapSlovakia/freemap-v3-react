import { createAction } from '@reduxjs/toolkit';

type Detail = {
  id: number;
  focus: boolean;
  /**
   * The element is shown because something outside this session asks for it —
   * a URL naming it — so it is kept rather than held as the transient preview.
   */
  pin?: boolean;
};

export const osmLoadNode = createAction<Detail>('OSM_LOAD_NODE');

export const osmLoadWay = createAction<Detail>('OSM_LOAD_WAY');

export const osmLoadRelation = createAction<Detail>('OSM_LOAD_RELATION');
