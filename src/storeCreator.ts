import storage from 'local-storage-fallback';
import { DefaultRootState } from 'react-redux';
import reduceReducers from 'reduce-reducers';
import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { StateType } from 'typesafe-actions';
import { is } from 'typescript-is';
import { RootAction } from './actions';
import { GalleryColorizeBy } from './actions/galleryActions';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { createProcessorMiddleware } from './middlewares/processorMiddleware';
import { statePersistingMiddleware } from './middlewares/statePersistingMiddleware';
import { createTrackingMiddleware } from './middlewares/trackingMiddleware';
import { createWebsocketMiddleware } from './middlewares/webSocketMiddleware';
import { authInitProcessor } from './processors/authInitProcessor';
import { authLoginWithFacebookProcessor } from './processors/authLoginWithFacebookProcessor';
import { authLoginWithGoogleProcessor } from './processors/authLoginWithGoogleProcessor';
import { authLoginWithOsm2Processor } from './processors/authLoginWithOsm2Processor';
import { authLoginWithOsmProcessor } from './processors/authLoginWithOsmProcessor';
import { authLogoutProcessor } from './processors/authLogoutProcessor';
import { cancelProcessor } from './processors/cancelProcessor';
import { changesetsProcessor } from './processors/changesetsProcessor';
import { cookieConsentProcessor } from './processors/cookieConsentProcessor';
import { elevationChartProcessor } from './processors/elevationChartProcessor';
import { errorProcessor } from './processors/errorProcessor';
import { galleryDeletePictureProcessor } from './processors/galleryDeletePictureProcessor';
import { galleryFetchUsersProcessor } from './processors/galleryFetchUsersProcessor';
import { galleryItemUploadProcessor } from './processors/galleryItemUploadProcessor';
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
import { gpxExportProcessor } from './processors/gpxExportProcessor';
import { l10nSetLanguageProcessor } from './processors/l10nSetLanguageProcessor';
import { legendProcessor } from './processors/legendProcessor';
import { locateProcessor } from './processors/locateProcessor';
import { mapDetailsProcessor } from './processors/mapDetailsProcessor';
import { mapRefocusProcessor } from './processors/mapRefocusProcessor';
import { mapsDeleteProcessor } from './processors/mapsDeleteProcessor';
import { mapsLoadListProcessor } from './processors/mapsLoadListProcessor';
import { mapsLoadProcessor } from './processors/mapsLoadProcessor';
import { mapdModalTransformer } from './processors/mapsModalProcessor';
import { mapsSaveProcessor } from './processors/mapsSaveProcessor';
import { mapTypeGaProcessor } from './processors/mapTypeGaProcessor';
import { measurementProcessor } from './processors/measurementProcessor';
import { objectsFetchProcessor } from './processors/objectsFetchProcessor';
import { openInExternalAppProcessor } from './processors/openInExternalAppProcessor';
import { osmLoadNodeProcessor } from './processors/osmLoadNodeProcessor';
import { osmLoadRelationProcessor } from './processors/osmLoadRelationProcessor';
import { osmLoadWayProcessor } from './processors/osmLoadWayProcessor';
import { exportPdfProcessor } from './processors/pdfExportProcessor';
import { routePlannerFindRouteProcessor } from './processors/routePlannerFindRouteProcessor';
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor';
import * as rpcProcessors from './processors/rpcProcessors';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor';
import {
  searchHighlightProcessor,
  searchHighlightTrafo,
} from './processors/searchHighlightProcessor';
import { searchProcessor } from './processors/searchProcessor';
import { setToolProcessor } from './processors/setToolProcessor';
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
import {
  tipsInitialState,
  tipsReducer,
  TipsState,
} from './reducers/tipsReducer';
import { toastsReducer } from './reducers/toastsReducer';
import { trackingReducer } from './reducers/trackingReducer';
import {
  trackViewerInitialState,
  trackViewerReducer,
  TrackViewerState,
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

declare module 'react-redux' {
  // eslint-disable-next-line
  export interface DefaultRootState extends StateType<CR> {}
}

const rootReducer = reduceReducers<DefaultRootState>(
  // TODO
  // eslint-disable-next-line
  // @ts-ignore
  preGlobalReducer,
  combinedReducers,
  postGlobalReducer,
);

const processorMiddleware = createProcessorMiddleware();

processorMiddleware.processors.push(
  errorProcessor,
  cancelProcessor,
  setToolProcessor,
  cookieConsentProcessor,
  authLogoutProcessor,
  mapRefocusProcessor,
  searchProcessor,
  searchHighlightTrafo,
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
  galleryItemUploadProcessor,
  routePlannerRefocusMapProcessor,
  routePlannerToggleElevationChartProcessor,
  routePlannerSetFromCurrentPositionProcessor,
  ...Object.values(trackingAccessTokenProcessors),
  ...Object.values(trackingDeviceProcessors),
  trackingFollowProcessor,
  mapdModalTransformer,
  mapsLoadListProcessor,
  mapsLoadProcessor,
  mapsDeleteProcessor,
  mapsSaveProcessor,
  wikiLayerProcessor,
  wikiLoadPreviewProcessor,
  legendProcessor,
  openInExternalAppProcessor,
  ...Object.values(rpcProcessors),
  gpxExportProcessor,
  exportPdfProcessor,
  authLoginWithFacebookProcessor,
  authLoginWithGoogleProcessor,
  authLoginWithOsmProcessor,
  authLoginWithOsm2Processor,
  urlProcessor,
);

export type MyStore = Store<DefaultRootState, RootAction>;

export function createReduxStore(): MyStore {
  let persisted: Partial<Record<keyof DefaultRootState, unknown>> = {};

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    // nothing
  }

  const initial: Partial<DefaultRootState> = {};

  if (is<Partial<MapState>>(persisted.map)) {
    initial.map = { ...mapInitialState, ...persisted.map };
  }

  if (is<Partial<L10nState>>(persisted.l10n)) {
    initial.l10n = { ...l10nInitialState, ...persisted.l10n };
  }

  if (is<Partial<TipsState>>(persisted.tips)) {
    initial.tips = { ...tipsInitialState, ...persisted.tips };
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

  return createStore(
    rootReducer as CR,
    initial,
    composeWithDevTools(
      applyMiddleware(
        errorHandlingMiddleware,
        loggerMiddleware,
        statePersistingMiddleware,
        createWebsocketMiddleware(),
        processorMiddleware,
        createTrackingMiddleware(),
      ),
    ),
  );
}
