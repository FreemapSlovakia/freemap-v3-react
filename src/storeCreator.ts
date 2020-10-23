import { createStore, applyMiddleware, combineReducers, Store } from 'redux';
import reduceReducers from 'reduce-reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { webSocketMiddleware } from './middlewares/webSocketMiddleware';
import * as rpcProcessors from './processors/rpcProcessors';
import { trackingMiddleware } from './middlewares/trackingMiddleware';
import { authReducer } from './reducers/authReducer';
import { changesetReducer } from './reducers/changesetsReducer';
import { elevationChartReducer } from './reducers/elevationChartReducer';
import { drawingLinesReducer } from './reducers/drawingLinesReducer';
import { galleryReducer } from './reducers/galleryReducer';
import { drawingPointsReducer } from './reducers/drawingPointsReducer';
import { mapsReducer } from './reducers/mapsReducer';
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
import { globalReducer } from './reducers/globalReducer';
import { StateType } from 'typesafe-actions';
import { RootAction } from './actions';
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
import { measurementProcessor } from './processors/measurementProcessor';
import { mapDetailsProcessor } from './processors/mapDetailsProcessor';
import { changesetsProcessor } from './processors/changesetsProcessor';
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
import { galleryFetchUsersProcessor } from './processors/galleryFetchUsersProcessor';
import { galleryPreventLayerHintProcessor } from './processors/galleryPreventLayerHintProcessor';
import { galleryDeletePictureProcessor } from './processors/galleryDeletePictureProcessor';
import { galleryRequestImageProcessor } from './processors/galleryRequestImageProcessor';
import { galleryRequestImagesByOrderProcessor } from './processors/galleryRequestImagesByOrderProcessor';
import { galleryRequestImagesByRadiusProcessor } from './processors/galleryRequestImagesByRadiusProcessor';
import { gallerySavePictureProcessor } from './processors/gallerySavePictureProcessor';
import { galleryShowImageGaProcessor } from './processors/galleryShowImageGaProcessor';
import { galleryShowLayerHintProcessor } from './processors/galleryShowLayerHintProcessor';
import { galleryShowOnTheMapProcessor } from './processors/galleryShowOnTheMapProcessor';
import { gallerySubmitCommentProcessor } from './processors/gallerySubmitCommentProcessor';
import {
  galleryUploadModalProcessor,
  galleryUploadModalTransformer,
} from './processors/galleryUploadModalProcessor';
import { gallerySubmitStarsProcessor } from './processors/gallerySubmitStarsProcessor';
import { urlProcessor } from './processors/urlProcessor';
import { routePlannerPreventHintProcssor } from './processors/routePlannerPreventHintProcssor';
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor';
import { routePlannerSetupTransportTypeProcessor } from './processors/routePlannerSetupTransportTypeProcessor';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor';
import { errorProcessor } from './processors/errorProcessor';
import { trackViewerSetTrackDataProcessor } from './processors/trackViewerSetTrackDataProcessor';
import { searchHighlightProcessor } from './processors/searchHighlightProcessor';
import { authInitProcessor } from './processors/authInitProcessor';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor';
import { gallerySetItemForPositionPickingProcessor } from './processors/gallerySetItemForPositionPickingProcessor';
import { mapsLoadListProcessor } from './processors/mapsLoadListProcessor';
import { mapsLoadProcessor } from './processors/mapsLoadProcessor';
import { mapsDeleteProcessor } from './processors/mapsDeleteProcessor';
import { mapsCreateProcessor } from './processors/mapsCreateProcessor';
import { mapsSaveProcessor } from './processors/mapsSaveProcessor';
import { mapsRenameProcessor } from './processors/mapsRenameProcessor';
import { wikiLayerProcessor } from './processors/wikiLayerProcessor';
import { wikiLoadPreviewProcessor } from './processors/wikiLoadPreviewProcessor';
import { wikiReducer } from './reducers/wikiReducer';
import { legendProcessor } from './processors/legendProcessor';

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
  tips: tipsReducer,
  toasts: toastsReducer,
  tracking: trackingReducer,
  trackViewer: trackViewerReducer,
  websocket: websocketReducer,
  maps: mapsReducer,
  wiki: wikiReducer,
};

const combinedReducers = combineReducers(reducers);

type CR = typeof combinedReducers;

export type RootState = StateType<CR>;

const rootReducer = reduceReducers<RootState>(combinedReducers, globalReducer);

processors.push(
  errorProcessor,
  cancelProcessor,
  authLogoutProcessor,
  searchProcessor,
  searchHighlightProcessor,
  tipsPreventProcessor,
  locateProcessor,
  saveSettingsProcessor,
  measurementProcessor,
  mapDetailsProcessor,
  changesetsProcessor,
  authInitProcessor,
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
  trackViewerSetTrackDataProcessor,
  trackViewerDownloadTrackProcessor,
  trackViewerGpxLoadProcessor,
  trackViewerUploadTrackProcessor,
  trackViewerToggleElevationChartProcessor,
  routePlannerFindRouteProcessor,
  galleryDeletePictureProcessor,
  galleryFetchUsersProcessor,
  galleryPreventLayerHintProcessor,
  galleryRequestImageProcessor,
  galleryRequestImagesByOrderProcessor,
  galleryRequestImagesByRadiusProcessor,
  gallerySavePictureProcessor,
  galleryShowImageGaProcessor,
  galleryShowLayerHintProcessor,
  galleryShowOnTheMapProcessor,
  gallerySetItemForPositionPickingProcessor,
  gallerySubmitCommentProcessor,
  gallerySubmitStarsProcessor,
  galleryUploadModalProcessor,
  galleryUploadModalTransformer,
  routePlannerPreventHintProcssor,
  routePlannerRefocusMapProcessor,
  routePlannerSetupTransportTypeProcessor,
  routePlannerToggleElevationChartProcessor,
  routePlannerSetFromCurrentPositionProcessor,
  ...Object.values(trackingAccessTokenProcessors),
  ...Object.values(trackingDeviceProcessors),
  trackingFollowProcessor,
  mapsLoadListProcessor,
  mapsLoadProcessor,
  mapsDeleteProcessor,
  mapsCreateProcessor,
  mapsSaveProcessor,
  mapsRenameProcessor,
  wikiLayerProcessor,
  wikiLoadPreviewProcessor,
  legendProcessor,
  ...Object.values(rpcProcessors),
  urlProcessor,
);

export type MyStore = Store<RootState, RootAction>;

export function createReduxStore(): MyStore {
  return createStore(
    rootReducer as CR,
    composeWithDevTools(
      applyMiddleware(
        loggerMiddleware,
        errorHandlingMiddleware,
        webSocketMiddleware,
        processorMiddleware,
        trackingMiddleware,
        utilityMiddleware,
      ),
    ),
  );
}
