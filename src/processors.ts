import { authDeleteAccountProcessor } from './processors/authDeleteAccountProcessor.js';
import { authDisconnectProcessor } from './processors/authDisconnectProcessor.js';
import {
  authInitProcessor,
  authTrackProcessor,
} from './processors/authInitProcessor.js';
import { authLogoutProcessor } from './processors/authLogoutProcessor.js';
import { authWithFacebookProcessor } from './processors/authWithFacebookProcessor.js';
import { authWithGarmin2Processor } from './processors/authWithGarmin2Processor.js';
import { authWithGarminProcessor } from './processors/authWithGarminProcessor.js';
import { authWithGoogleProcessor } from './processors/authWithGoogleProcessor.js';
import { authWithOsm2Processor } from './processors/authWithOsm2Processor.js';
import { authWithOsmProcessor } from './processors/authWithOsmProcessor.js';
import { cancelProcessor } from './processors/cancelProcessor.js';
import {
  changesetsProcessor,
  changesetsTrackProcessor,
} from './processors/changesetsProcessor.js';
import { convertToDrawingProcessor } from './processors/convertToDrawingProcessor.js';
import { cookieConsentProcessor } from './processors/cookieConsentProcessor.js';
import { deleteProcessor } from './processors/deleteProcessor.js';
import { downloadMapProcessor } from './processors/downloadMapProcessor.js';
import { elevationChartProcessor } from './processors/elevationChartProcessor.js';
import { errorProcessor } from './processors/errorProcessor.js';
import { exportMapFeaturesProcessor } from './processors/exportMapFeaturesProcessor.js';
import { fetchPurchasesProcessor } from './processors/fetchPurchasesProcessor.js';
import { galleryDeletePictureProcessor } from './processors/galleryDeletePictureProcessor.js';
import { galleryFetchUsersProcessor } from './processors/galleryFetchUsersProcessor.js';
import { galleryItemUploadProcessor } from './processors/galleryItemUploadProcessor.js';
import { galleryMakeAllPremiumOrFreeProcessor } from './processors/galleryMakeAllPremiumOrFreeProcessor.js';
import { galleryQuickAddTagProcessor } from './processors/galleryQuickAddTagProcessor.js';
import { galleryRequestImageProcessor } from './processors/galleryRequestImageProcessor.js';
import { galleryRequestImagesByOrderProcessor } from './processors/galleryRequestImagesByOrderProcessor.js';
import { galleryRequestImagesByRadiusProcessor } from './processors/galleryRequestImagesByRadiusProcessor.js';
import { gallerySavePictureProcessor } from './processors/gallerySavePictureProcessor.js';
import { gallerySetItemForPositionPickingProcessor } from './processors/gallerySetItemForPositionPickingProcessor.js';
import { galleryShowImageGaProcessor } from './processors/galleryShowImageGaProcessor.js';
import { galleryShowOnTheMapProcessor } from './processors/galleryShowOnTheMapProcessor.js';
import { gallerySubmitCommentProcessor } from './processors/gallerySubmitCommentProcessor.js';
import { gallerySubmitStarsProcessor } from './processors/gallerySubmitStarsProcessor.js';
import { galleryUploadModalProcessor } from './processors/galleryUploadModalProcessor.js';
import { l10nSetLanguageProcessor } from './processors/l10nSetLanguageProcessor.js';
import { legacyMapWarningProcessor } from './processors/legacyMapWarningProcessor.js';
import { legendProcessor } from './processors/legendProcessor.js';
import { locateProcessor } from './processors/locateProcessor.js';
import { mapDetailsProcessor } from './processors/mapDetailsProcessor.js';
import { exportMapProcessor } from './processors/mapExportProcessor.js';
import { mapRefocusProcessor } from './processors/mapRefocusProcessor.js';
import { mapsDeleteProcessor } from './processors/mapsDeleteProcessor.js';
import { mapsLoadListProcessor } from './processors/mapsLoadListProcessor.js';
import { mapsLoadProcessor } from './processors/mapsLoadProcessor.js';
import { mapsSaveProcessor } from './processors/mapsSaveProcessor.js';
import { mapTypeGaProcessor } from './processors/mapTypeGaProcessor.js';
import { measurementProcessor } from './processors/measurementProcessor.js';
import {
  objectsChangePredicateProcessor,
  objectsFetchProcessor,
} from './processors/objectsFetchProcessor.js';
import { openInExternalAppProcessor } from './processors/openInExternalAppProcessor.js';
import { osmLoadNodeProcessor } from './processors/osmLoadNodeProcessor.js';
import { osmLoadRelationProcessor } from './processors/osmLoadRelationProcessor.js';
import { osmLoadWayProcessor } from './processors/osmLoadWayProcessor.js';
import { purchaseProcessor } from './processors/purchaseProcessor.js';
import { routePlannerFindRouteProcessor } from './processors/routePlannerFindRouteProcessor.js';
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor.js';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor.js';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor.js';
import * as rpcProcessors from './processors/rpcProcessors.js';
import { saveHomeLocationProcessor } from './processors/saveHomeLocationProcessor.js';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor.js';
import {
  searchHighlightProcessor,
  searchHighlightTrafo,
} from './processors/searchHighlightProcessor.js';
import { searchProcessor } from './processors/searchProcessor.js';
import { setActiveModalTransformer } from './processors/setActiveModalProcessor.js';
import { setToolProcessor } from './processors/setToolProcessor.js';
import { toastsAddProcessor } from './processors/toastsAddProcessor.js';
import { toastsCancelTypeProcessor } from './processors/toastsCancelTypeProcessor.js';
import { toastsRemoveProcessor } from './processors/toastsRemoveProcessor.js';
import { toastsRestartTimeoutProcessor } from './processors/toastsRestartTimeoutProcessor.js';
import { toastsStopTimeoutProcessor } from './processors/toastsStopTimeoutProcessor.js';
import * as trackingAccessTokenProcessors from './processors/trackingAccessTokenProcessors.js';
import * as trackingDeviceProcessors from './processors/trackingDeviceProcessors.js';
import { trackingFollowProcessor } from './processors/trackingFollowProcessors.js';
import { trackViewerDownloadTrackProcessor } from './processors/trackViewerDownloadTrackProcessor.js';
import { trackViewerGpxLoadProcessor } from './processors/trackViewerGpxLoadProcessor.js';
import { trackViewerSetTrackDataProcessor } from './processors/trackViewerSetTrackDataProcessor.js';
import { trackViewerToggleElevationChartProcessor } from './processors/trackViewerToggleElevationChartProcessor.js';
import { trackViewerUploadTrackProcessor } from './processors/trackViewerUploadTrackProcessor.js';
import { urlProcessor } from './processors/urlProcessor.js';
import { wikiLayerProcessor } from './processors/wikiLayerProcessor.js';
import { wikiLoadPreviewProcessor } from './processors/wikiLoadPreviewProcessor.js';

export const processors = [
  errorProcessor,
  toastsCancelTypeProcessor,
  cancelProcessor,
  setToolProcessor,
  deleteProcessor,
  convertToDrawingProcessor,
  cookieConsentProcessor,
  authLogoutProcessor,
  authDisconnectProcessor,
  authDeleteAccountProcessor,
  mapRefocusProcessor,
  searchProcessor,
  searchHighlightTrafo,
  searchHighlightProcessor,
  saveHomeLocationProcessor,
  locateProcessor,
  saveSettingsProcessor,
  measurementProcessor,
  mapDetailsProcessor,
  changesetsProcessor,
  changesetsTrackProcessor,
  authInitProcessor,
  authTrackProcessor,
  l10nSetLanguageProcessor,
  elevationChartProcessor,
  objectsFetchProcessor,
  objectsChangePredicateProcessor,
  osmLoadNodeProcessor,
  osmLoadWayProcessor,
  osmLoadRelationProcessor,
  mapTypeGaProcessor,
  toastsAddProcessor,
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
  galleryQuickAddTagProcessor,
  galleryItemUploadProcessor,
  galleryMakeAllPremiumOrFreeProcessor,
  routePlannerRefocusMapProcessor,
  routePlannerToggleElevationChartProcessor,
  routePlannerSetFromCurrentPositionProcessor,
  ...Object.values(trackingAccessTokenProcessors),
  ...Object.values(trackingDeviceProcessors),
  trackingFollowProcessor,
  setActiveModalTransformer,
  mapsLoadListProcessor,
  mapsLoadProcessor,
  mapsDeleteProcessor,
  mapsSaveProcessor,
  wikiLayerProcessor,
  wikiLoadPreviewProcessor,
  legendProcessor,
  legacyMapWarningProcessor,
  openInExternalAppProcessor,
  ...Object.values(rpcProcessors),
  exportMapFeaturesProcessor,
  exportMapProcessor,
  authWithFacebookProcessor,
  authWithGoogleProcessor,
  authWithOsmProcessor,
  authWithOsm2Processor,
  authWithGarminProcessor,
  authWithGarmin2Processor,
  fetchPurchasesProcessor,
  downloadMapProcessor,
  purchaseProcessor,
  urlProcessor,
];
