import storage from 'local-storage-fallback';
import reduceReducers from 'reduce-reducers';
import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { StateType } from 'typesafe-actions';
import { is } from 'typescript-is';
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
import { cancelProcessor } from './processors/cancelProcessor';
import { changesetsProcessor } from './processors/changesetsProcessor';
import { elevationChartProcessor } from './processors/elevationChartProcessor';
import { errorProcessor } from './processors/errorProcessor';
import { galleryDeletePictureProcessor } from './processors/galleryDeletePictureProcessor';
import { galleryFetchUsersProcessor } from './processors/galleryFetchUsersProcessor';
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
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor';
import { routePlannerSetupTransportTypeProcessor } from './processors/routePlannerSetupTransportTypeProcessor';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor';
import * as rpcProcessors from './processors/rpcProcessors';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor';
import { searchHighlightProcessor } from './processors/searchHighlightProcessor';
import { searchProcessor } from './processors/searchProcessor';
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
import { authInitialState, authReducer } from './reducers/authReducer';
import { changesetReducer } from './reducers/changesetsReducer';
import { drawingLinesReducer } from './reducers/drawingLinesReducer';
import { drawingPointsReducer } from './reducers/drawingPointsReducer';
import { elevationChartReducer } from './reducers/elevationChartReducer';
import { galleryReducer } from './reducers/galleryReducer';
import { postGlobalReducer, preGlobalReducer } from './reducers/globalReducer';
import { l10nInitialState, l10nReducer } from './reducers/l10nReducer';
import { mainInitialState, mainReducer } from './reducers/mainReducer';
import { mapDetailsReducer } from './reducers/mapDetailsReducer';
import { mapInitialState, mapReducer } from './reducers/mapReducer';
import { mapsReducer } from './reducers/mapsReducer';
import { objectsReducer } from './reducers/objectsReducer';
import {
  routePlannerInitialState,
  routePlannerReducer,
} from './reducers/routePlannerReducer';
import { searchReducer } from './reducers/searchReducer';
import { tipsInitialState, tipsReducer } from './reducers/tipsReducer';
import { toastsReducer } from './reducers/toastsReducer';
import { trackingReducer } from './reducers/trackingReducer';
import {
  trackViewerInitialState,
  trackViewerReducer,
} from './reducers/trackViewerReducer';
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
  l10nSetLanguageProcessor,
  elevationChartProcessor,
  objectsFetchProcessor,
  osmLoadNodeProcessor,
  osmLoadWayProcessor,
  osmLoadRelationProcessor,
  mapTypeGaProcessor,
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
  let persisted: Partial<RootState> = {};

  try {
    const data = storage.getItem('store');

    if (data) {
      persisted = JSON.parse(data);

      if (!is<Partial<RootState>>(persisted)) {
        persisted = {};
      }
    }
  } catch {
    // nothing
  }

  Object.assign(persisted, {
    map: Object.assign({}, mapInitialState, persisted.map),

    l10n: Object.assign({}, l10nInitialState, persisted.l10n),

    tips: Object.assign({}, tipsInitialState, persisted.tips),

    auth: Object.assign({}, authInitialState, persisted.auth),

    main: Object.assign({}, mainInitialState, persisted.main),

    routePlanner: Object.assign(
      {},
      routePlannerInitialState,
      persisted.routePlanner,
    ),

    trackViewer: Object.assign(
      {},
      trackViewerInitialState,
      persisted.trackViewer,
    ),
  });

  return createStore(
    rootReducer as CR,
    persisted,
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
