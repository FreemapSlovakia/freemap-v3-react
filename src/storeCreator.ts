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
import { mapDetailsProcessor } from './processors/mapDetailsProcessor';
import { changesetsProcessor } from './processors/changesetsProcessor';
import { authLoginWithFacebookProcessor } from './processors/authLoginWithFacebookProcessor';
import { authLoginWithGoogleProcessor } from './processors/authLoginWithGoogleProcessor';
import { authLoginWithOsmProcessor } from './processors/authLoginWithOsmProcessor';
import { authSaveUserProcessor } from './processors/authSaveUserProcessor';
import { l10nSetLanguageProcessor } from './processors/l10nSetLanguageProcessor';
import { elevationChartProcessor } from './processors/elevationChartProcessor';
import { objectsFetchProcessor } from './processors/objectsFetchProcessor';
import { osmLoadNodeProcessor } from './processors/osmLoadNodeProcessor';
import { osmLoadWayProcessor } from './processors/osmLoadWayProcessor';
import { osmLoadRelationProcessor } from './processors/osmLoadRelationProcessor';
import { mapTypeGaProcessor } from './processors/mapTypeGaProcessor';
import { storageProcessor } from './processors/storageProcessor';
import { toastsCancelTypeProcessor } from './processors/toastsCancelTypeProcessor';
import { toastsRemoveProcessor } from './processors/toastsRemoveProcessor';
import { toastsStopTimeoutProcessor } from './processors/toastsStopTimeoutProcessor';
import { toastsAddProcessor } from './processors/toastsAddProcessor';
import { toastsRestartTimeoutProcessor } from './processors/toastsRestartTimeoutProcessor';
import { trackViewerDownloadTrackProcessor } from './processors/trackViewerDownloadTrackProcessor';
import { trackViewerGpxLoadProcessor } from './processors/trackViewerGpxLoadProcessor';
import { trackViewerUploadTrackProcessor } from './processors/trackViewerUploadTrackProcessor';
import { trackViewerToggleElevationChartProcessor } from './processors/trackViewerToggleElevationChartProcessor';
import { routePlannerFindRouteProcessor } from './processors/routePlannerFindRouteProcessor';

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
  mapDetailsProcessor,
  changesetsProcessor,
  authLoginWithFacebookProcessor,
  authLoginWithGoogleProcessor,
  authLoginWithOsmProcessor,
  authSaveUserProcessor,
  l10nSetLanguageProcessor,
  elevationChartProcessor,
  objectsFetchProcessor,
  osmLoadNodeProcessor,
  osmLoadWayProcessor,
  osmLoadRelationProcessor,
  mapTypeGaProcessor,
  storageProcessor,
  toastsAddProcessor,
  toastsCancelTypeProcessor,
  toastsRemoveProcessor,
  toastsRestartTimeoutProcessor,
  toastsStopTimeoutProcessor,
  trackViewerDownloadTrackProcessor,
  trackViewerGpxLoadProcessor,
  trackViewerUploadTrackProcessor,
  trackViewerToggleElevationChartProcessor,
  routePlannerFindRouteProcessor,
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
