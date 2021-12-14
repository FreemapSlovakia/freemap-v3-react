import { DefaultRootState } from 'react-redux';
import reduceReducers from 'reduce-reducers';
import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';
import { authReducer } from './reducers/authReducer';
import { changesetReducer } from './reducers/changesetsReducer';
import { drawingLinesReducer } from './reducers/drawingLinesReducer';
import { drawingPointsReducer } from './reducers/drawingPointsReducer';
import { elevationChartReducer } from './reducers/elevationChartReducer';
import { galleryReducer } from './reducers/galleryReducer';
import { postGlobalReducer, preGlobalReducer } from './reducers/globalReducer';
import { l10nReducer } from './reducers/l10nReducer';
import { mainReducer } from './reducers/mainReducer';
import { mapDetailsReducer } from './reducers/mapDetailsReducer';
import { mapReducer } from './reducers/mapReducer';
import { mapsReducer } from './reducers/mapsReducer';
import { objectsReducer } from './reducers/objectsReducer';
import { routePlannerReducer } from './reducers/routePlannerReducer';
import { searchReducer } from './reducers/searchReducer';
import { toastsReducer } from './reducers/toastsReducer';
import { trackingReducer } from './reducers/trackingReducer';
import { trackViewerReducer } from './reducers/trackViewerReducer';
import { websocketReducer } from './reducers/websocketReducer';
import { wikiReducer } from './reducers/wikiReducer';

const reducers = {
  auth: authReducer,
  changesets: changesetReducer,
  drawingLines: drawingLinesReducer,
  drawingPoints: drawingPointsReducer,
  elevationChart: elevationChartReducer,
  gallery: galleryReducer,
  l10n: l10nReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  map: mapReducer,
  objects: objectsReducer,
  routePlanner: routePlannerReducer,
  search: searchReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
  maps: mapsReducer,
  wiki: wikiReducer,
};

const combinedReducers = combineReducers(reducers);

export type CR = typeof combinedReducers;

declare module 'react-redux' {
  // eslint-disable-next-line
  export interface DefaultRootState extends StateType<CR> {}
}

export const rootReducer = reduceReducers<DefaultRootState>(
  preGlobalReducer,
  combinedReducers,
  postGlobalReducer,
);
