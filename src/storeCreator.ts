import { createStore, applyMiddleware, combineReducers, Store } from 'redux';
import { logicMiddleware } from 'fm3/middlewares/logicMiddleware';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { webSocketMiddleware } from './middlewares/webSocketMiddleware';
import { rpcMiddleware } from './middlewares/rpcMiddleware';
import { trackingMiddleware } from './middlewares/trackingMiddleware';
import { authReducer } from './reducers/authReducer';
import { areaMeasurementReducer } from './reducers/areaMeasurementReducer';
import { changesetReducer } from './reducers/changesetsReducer';
import { elevationChartReducer } from './reducers/elevationChartReducer';
import { distanceMeasurementReducer } from './reducers/distanceMeasurementReducer';
import { elevationMeasurementReducer } from './reducers/elevationMeasurementReducer';
import { galleryReducer } from './reducers/galleryReducer';
import { infoPointReducer } from './reducers/infoPointReducer';
import { l10nReducer } from './reducers/l10nReducer';
import { mainReducer } from './reducers/mainReducer';
import { mapDetailsReducer } from './reducers/mapDetailsReducer';
import { mapReducer } from './reducers/mapReducer';
import { objectsReducer } from './reducers/objectsReducer';
import { routePlannerReducer } from './reducers/routePlannerReducer';
import { searchReducer } from './reducers/searchReducer';
import { tipsReducer } from './reducers/tipsReducer';
import { toastsReducer } from './reducers/toastsReducer';
import { trackingReducer } from './reducers/trackingReducer';
import { trackViewerReducer } from './reducers/trackViewerReducer';
import { websocketReducer } from './reducers/websocketReducer';
import { StateType } from 'typesafe-actions';
import { RootAction } from './actions';
import { trackingDeviceMiddleware } from './middlewares/trackingDeviceMiddleware';
import { trackingFollowMiddleware } from './middlewares/trackingFollowMiddleware';
import { trackingAccessTokenMiddleware } from './middlewares/trackingAccessTokenMiddleware';
import { pdfExportMiddleware } from './middlewares/pdfExportMiddleware';
import { utilityMiddleware } from './middlewares/utilityMiddleware';

const reducers = {
  areaMeasurement: areaMeasurementReducer,
  auth: authReducer,
  changesets: changesetReducer,
  distanceMeasurement: distanceMeasurementReducer,
  elevationChart: elevationChartReducer,
  elevationMeasurement: elevationMeasurementReducer,
  gallery: galleryReducer,
  infoPoint: infoPointReducer,
  l10n: l10nReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  map: mapReducer,
  objects: objectsReducer,
  routePlanner: routePlannerReducer,
  search: searchReducer,
  tips: tipsReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
};

const rootReducer = combineReducers(reducers);

export type RootState = StateType<typeof rootReducer>;

export default function createReduxStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(
      loggerMiddleware,
      errorHandlingMiddleware,
      webSocketMiddleware,
      logicMiddleware,
      rpcMiddleware,
      trackingMiddleware,
      trackingDeviceMiddleware,
      trackingAccessTokenMiddleware,
      trackingFollowMiddleware,
      pdfExportMiddleware,
      utilityMiddleware,
    ),
  );

  logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

  return store;
}

export type MyStore = Store<RootState, RootAction>;
