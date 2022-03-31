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
import { galleryUploadModalProcessor } from './processors/galleryUploadModalProcessor';
import { gpxExportProcessor } from './processors/gpxExportProcessor';
import { l10nSetLanguageProcessor } from './processors/l10nSetLanguageProcessor';
import { legendProcessor } from './processors/legendProcessor';
import { locateProcessor } from './processors/locateProcessor';
import { mapDetailsProcessor } from './processors/mapDetailsProcessor';
import { mapRefocusProcessor } from './processors/mapRefocusProcessor';
import { mapsDeleteProcessor } from './processors/mapsDeleteProcessor';
import { mapsLoadListProcessor } from './processors/mapsLoadListProcessor';
import { mapsLoadProcessor } from './processors/mapsLoadProcessor';
import { mapsSaveProcessor } from './processors/mapsSaveProcessor';
import { mapTypeGaProcessor } from './processors/mapTypeGaProcessor';
import { measurementProcessor } from './processors/measurementProcessor';
import { objectsFetchProcessor } from './processors/objectsFetchProcessor';
import { openInExternalAppProcessor } from './processors/openInExternalAppProcessor';
import { osmLoadNodeProcessor } from './processors/osmLoadNodeProcessor';
import { osmLoadRelationProcessor } from './processors/osmLoadRelationProcessor';
import { osmLoadWayProcessor } from './processors/osmLoadWayProcessor';
import { exportPdfProcessor } from './processors/pdfExportProcessor';
import { removeAdsProcessor } from './processors/removeAdsProcessor';
import { routePlannerFindRouteProcessor } from './processors/routePlannerFindRouteProcessor';
import { routePlannerRefocusMapProcessor } from './processors/routePlannerRefocusMapProcessor';
import { routePlannerSetFromCurrentPositionProcessor } from './processors/routePlannerSetFromCurrentPositionProcessor';
import { routePlannerToggleElevationChartProcessor } from './processors/routePlannerToggleElevationChartProcessor';
import * as rpcProcessors from './processors/rpcProcessors';
import { saveCustomLayersProcessor } from './processors/saveCustomLayersProcessor';
import { saveHomeLocationProcessor } from './processors/saveHomeLocationProcessor';
import { saveSettingsProcessor } from './processors/saveSettingsProcessor';
import {
  searchHighlightProcessor,
  searchHighlightTrafo,
} from './processors/searchHighlightProcessor';
import { searchProcessor } from './processors/searchProcessor';
import { setActiveModalTransformer } from './processors/setActiveModalProcessor';
import { setToolProcessor } from './processors/setToolProcessor';
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

export const processors = [
  errorProcessor,
  toastsCancelTypeProcessor,
  cancelProcessor,
  setToolProcessor,
  cookieConsentProcessor,
  authLogoutProcessor,
  mapRefocusProcessor,
  searchProcessor,
  searchHighlightTrafo,
  searchHighlightProcessor,
  saveHomeLocationProcessor,
  locateProcessor,
  saveSettingsProcessor,
  saveCustomLayersProcessor,
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
  galleryItemUploadProcessor,
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
  openInExternalAppProcessor,
  ...Object.values(rpcProcessors),
  gpxExportProcessor,
  exportPdfProcessor,
  authLoginWithFacebookProcessor,
  authLoginWithGoogleProcessor,
  authLoginWithOsmProcessor,
  authLoginWithOsm2Processor,
  removeAdsProcessor,
  urlProcessor,
];
