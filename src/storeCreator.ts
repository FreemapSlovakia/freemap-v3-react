import { createStore, applyMiddleware, combineReducers, Store } from 'redux';
import { logicMiddleware } from 'fm3/middlewares/logicMiddleware';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { webSocketMiddleware } from './middlewares/webSocketMiddleware';
import * as rpcProcessors from './processors/rpcProcessors';
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
import { exportPdfProcessor } from './processors/pdfExportProcessor';
import { utilityMiddleware } from './middlewares/utilityMiddleware';
import {
  processorMiddleware,
  processors,
} from './middlewares/processorMiddleware';
import * as trackingAccessTokenProcessors from './processors/trackingAccessTokenProcessors';
import * as trackingDeviceProcessors from './processors/trackingDeviceProcessors';
import { trackingFollowProcessor } from './processors/trackingFollowProcessors';
import { cancelProcessor } from './processors/cancelProcessor';
import { authLogoutProcessor } from './processors/authLogoutProcessor';
import { searchProcessor } from './processors/searchProcessor';
import { tipsPreventProcessor } from './processors/tipsPreventProcessor';
import { locateProcessor } from './processors/locateProcessor';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor';
import { gpxExportProcessor } from './processors/gpxExportProcessor';
import { elevationMeasurementProcessor } from './processors/elevationMeasurementProcessor';

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

processors.push(
  cancelProcessor,
  authLogoutProcessor,
  searchProcessor,
  tipsPreventProcessor,
  locateProcessor,
  saveSettingsProcessor,
  gpxExportProcessor,
  elevationMeasurementProcessor,
  trackingAccessTokenProcessors.loadAccessTokensProcessor,
  trackingAccessTokenProcessors.saveAccessTokenProcessor,
  trackingAccessTokenProcessors.deleteAccessTokenProcessor,
  trackingDeviceProcessors.loadDevicesProcessor,
  trackingDeviceProcessors.saveDeviceProcessor,
  trackingDeviceProcessors.deleteDeviceProcessor,
  trackingFollowProcessor,
  rpcProcessors.rpcCallProcessor,
  rpcProcessors.rpcWsStateProcessor,
  rpcProcessors.wsReceivedProcessor,
  exportPdfProcessor,
);

export default function createReduxStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(
      loggerMiddleware,
      errorHandlingMiddleware,
      webSocketMiddleware,
      logicMiddleware,
      processorMiddleware,
      trackingMiddleware,
      utilityMiddleware,
    ),
  );

  logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

  return store;
}

export type MyStore = Store<RootState, RootAction>;
