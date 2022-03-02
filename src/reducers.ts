import storage from 'local-storage-fallback';
import { DefaultRootState } from 'react-redux';
import reduceReducers from 'reduce-reducers';
import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';
import { is } from 'typescript-is';
import { GalleryColorizeBy } from './actions/galleryActions';
import {
  authInitialState,
  authReducer,
  AuthState,
} from './reducers/authReducer';
import { changesetReducer } from './reducers/changesetsReducer';
import { drawingLinesReducer } from './reducers/drawingLinesReducer';
import { drawingPointsReducer } from './reducers/drawingPointsReducer';
import { elevationChartReducer } from './reducers/elevationChartReducer';
import { galleryInitialState, galleryReducer } from './reducers/galleryReducer';
import { postGlobalReducer, preGlobalReducer } from './reducers/globalReducer';
import {
  l10nInitialState,
  l10nReducer,
  L10nState,
} from './reducers/l10nReducer';
import {
  mainInitialState,
  mainReducer,
  MainState,
} from './reducers/mainReducer';
import { mapDetailsReducer } from './reducers/mapDetailsReducer';
import { mapInitialState, mapReducer, MapState } from './reducers/mapReducer';
import { mapsReducer } from './reducers/mapsReducer';
import { objectsReducer } from './reducers/objectsReducer';
import {
  routePlannerInitialState,
  routePlannerReducer,
  RoutePlannerState,
} from './reducers/routePlannerReducer';
import { searchReducer } from './reducers/searchReducer';
import { toastsReducer } from './reducers/toastsReducer';
import { trackingReducer } from './reducers/trackingReducer';
import {
  trackViewerInitialState,
  trackViewerReducer,
  TrackViewerState,
} from './reducers/trackViewerReducer';
import { websocketReducer } from './reducers/websocketReducer';
import { wikiReducer } from './reducers/wikiReducer';
import { transportTypeDefs } from './transportTypeDefs';

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

export type CombinedReducers = typeof combinedReducers;

declare module 'react-redux' {
  // eslint-disable-next-line
  export interface DefaultRootState extends StateType<CombinedReducers> {}
}

export const rootReducer = reduceReducers<DefaultRootState>(
  preGlobalReducer,
  combinedReducers,
  postGlobalReducer,
);

export function getInitialState() {
  let persisted: Partial<Record<keyof DefaultRootState, unknown>>;

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    persisted = {};
  }

  const initial: Partial<DefaultRootState> = {};

  if (is<Partial<MapState>>(persisted.map)) {
    initial.map = { ...mapInitialState, ...persisted.map };
  }

  if (is<Partial<L10nState>>(persisted.l10n)) {
    initial.l10n = { ...l10nInitialState, ...persisted.l10n };
  }

  if (is<Partial<AuthState>>(persisted.auth)) {
    initial.auth = { ...authInitialState, ...persisted.auth };
  }

  if (is<Partial<MainState>>(persisted.main)) {
    initial.main = { ...mainInitialState, ...persisted.main };
  }

  if (is<Partial<RoutePlannerState>>(persisted.routePlanner)) {
    initial.routePlanner = {
      ...routePlannerInitialState,
      ...persisted.routePlanner,
    };
  }

  if (is<Partial<TrackViewerState>>(persisted.trackViewer)) {
    initial.trackViewer = {
      ...trackViewerInitialState,
      ...persisted.trackViewer,
    };
  }

  if (is<{ colorizeBy: GalleryColorizeBy | null }>(persisted.gallery)) {
    initial.gallery = {
      ...galleryInitialState,
      ...persisted.gallery,
    };
  }

  const tt = initial.routePlanner?.transportType;

  if (initial.routePlanner && tt && !transportTypeDefs[tt]) {
    initial.routePlanner.transportType = 'hiking';
  }

  return initial;
}
