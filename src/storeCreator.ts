import reduceReducers from 'reduce-reducers';
import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { StateType } from 'typesafe-actions';
import { RootAction } from './actions';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import {
  processorMiddleware,
  processors,
} from './middlewares/processorMiddleware';
import { trackingMiddleware } from './middlewares/trackingMiddleware';
import { utilityMiddleware } from './middlewares/utilityMiddleware';
import { webSocketMiddleware } from './middlewares/webSocketMiddleware';
import { authInitProcessor } from './processors/authInitProcessor';
import { authLogoutProcessor } from './processors/authLogoutProcessor';
import { authSaveUserProcessor } from './processors/authSaveUserProcessor';
import { cancelProcessor } from './processors/cancelProcessor';
import { changesetsProcessor } from './processors/changesetsProcessor';
import { elevationChartProcessor } from './processors/elevationChartProcessor';
import { errorProcessor } from './processors/errorProcessor';
import { galleryDeletePictureProcessor } from './processors/galleryDeletePictureProcessor';
import { galleryFetchUsersProcessor } from './processors/galleryFetchUsersProcessor';
import { galleryPreventLayerHintProcessor } from './processors/galleryPreventLayerHintProcessor';
import { galleryRequestImageProcessor } from './processors/galleryRequestImageProcessor';
import { galleryRequestImagesByOrderProcessor } from './processors/galleryRequestImagesByOrderProcessor';
import { galleryRequestImagesByRadiusProcessor } from './processors/galleryRequestImagesByRadiusProcessor';
import { gallerySavePictureProcessor } from './processors/gallerySavePictureProcessor';
import { gallerySetItemForPositionPickingProcessor } from './processors/gallerySetItemForPositionPickingProcessor';
import { galleryShowImageGaProcessor } from './processors/galleryShowImageGaProcessor';
import { galleryShowOnTheMapProcessor } from './processors/galleryShowOnTheMapProcessor';
import { gallerySubmitCommentProcessor } from './processors/gallerySubmitCommentProcessor';
import { gallerySubmitStarsProcessor } from './processors/gallerySubmitStarsProcessor';
import {
  galleryUploadModalProcessor,
  galleryUploadModalTransformer,
} from './processors/galleryUploadModalProcessor';
import { l10nSetLanguageProcessor } from './processors/l10nSetLanguageProcessor';
import { legendProcessor } from './processors/legendProcessor';
import { locateProcessor } from './processors/locateProcessor';
import { mapDetailsProcessor } from './processors/mapDetailsProcessor';
import { mapRefocusProcessor } from './processors/mapRefocusProcessor';
import { mapsCreateProcessor } from './processors/mapsCreateProcessor';
import { mapsDeleteProcessor } from './processors/mapsDeleteProcessor';
import { mapsLoadListProcessor } from './processors/mapsLoadListProcessor';
import { mapsLoadProcessor } from './processors/mapsLoadProcessor';
import { mapsRenameProcessor } from './processors/mapsRenameProcessor';
import { mapsSaveProcessor } from './processors/mapsSaveProcessor';
import { mapTypeGaProcessor } from './processors/mapTypeGaProcessor';
import { measurementProcessor } from './processors/measurementProcessor';
import { objectsFetchProcessor } from './processors/objectsFetchProcessor';
import { openInExternalAppProcessor } from './processors/openInExternalAppProcessor';
import { osmLoadNodeProcessor } from './processors/osmLoadNodeProcessor';
import { osmLoadRelationProcessor } from './processors/osmLoadRelationProcessor';
import { osmLoadWayProcessor } from './processors/osmLoadWayProcessor';
import { routePlannerFindRouteProcessor } from './processors/routePlannerFindRouteProcessor';
import { routePlannerPreventHintProcssor } from './processors/routePlannerPreventHintProcssor';
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor';
import { routePlannerSetupTransportTypeProcessor } from './processors/routePlannerSetupTransportTypeProcessor';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor';
import * as rpcProcessors from './processors/rpcProcessors';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor';
import { searchHighlightProcessor } from './processors/searchHighlightProcessor';
import { searchProcessor } from './processors/searchProcessor';
import { storageProcessor } from './processors/storageProcessor';
import { tipsPreventProcessor } from './processors/tipsPreventProcessor';
import { toastsAddProcessor } from './processors/toastsAddProcessor';
import { toastsCancelTypeProcessor } from './processors/toastsCancelTypeProcessor';
import { toastsRemoveProcessor } from './processors/toastsRemoveProcessor';
import { toastsRestartTimeoutProcessor } from './processors/toastsRestartTimeoutProcessor';
import { toastsStopTimeoutProcessor } from './processors/toastsStopTimeoutProcessor';
import * as trackingAccessTokenProcessors from './processors/trackingAccessTokenProcessors';
import * as trackingDeviceProcessors from './processors/trackingDeviceProcessors';
import { trackingFollowProcessor } from './processors/trackingFollowProcessors';
import { trackViewerDownloadTrackProcessor } from './processors/trackViewerDownloadTrackProcessor';
import { trackViewerGpxLoadProcessor } from './processors/trackViewerGpxLoadProcessor';
import { trackViewerSetTrackDataProcessor } from './processors/trackViewerSetTrackDataProcessor';
import { trackViewerToggleElevationChartProcessor } from './processors/trackViewerToggleElevationChartProcessor';
import { trackViewerUploadTrackProcessor } from './processors/trackViewerUploadTrackProcessor';
import { urlProcessor } from './processors/urlProcessor';
import { wikiLayerProcessor } from './processors/wikiLayerProcessor';
import { wikiLoadPreviewProcessor } from './processors/wikiLoadPreviewProcessor';
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
import { tipsReducer } from './reducers/tipsReducer';
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

const rootReducer = reduceReducers<RootState>(
  // TODO
  // eslint-disable-next-line
  // @ts-ignore
  preGlobalReducer,
  combinedReducers,
  postGlobalReducer,
);

processors.push(
  errorProcessor,
  cancelProcessor,
  authLogoutProcessor,
  mapRefocusProcessor,
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
  openInExternalAppProcessor,
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
