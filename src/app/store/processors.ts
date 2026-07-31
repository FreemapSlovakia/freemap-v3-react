import { authProcessors } from '@features/auth/model/authProcessors.js';
import { authDeleteAccountProcessor } from '@features/auth/model/processors/authDeleteAccountProcessor.js';
import { authDisconnectProcessor } from '@features/auth/model/processors/authDisconnectProcessor.js';
import {
  authInitProcessor,
  authTrackProcessor,
} from '@features/auth/model/processors/authInitProcessor.js';
import { authLogoutProcessor } from '@features/auth/model/processors/authLogoutProcessor.js';
import {
  cachedMapDeletedProcessor,
  cachedMapRenamedProcessor,
  cacheTilesCancelProcessor,
  cacheTilesPauseProcessor,
  cacheTilesRestartProcessor,
  cacheTilesResumeProcessor,
  cacheTilesStartProcessor,
} from '@features/cachedMaps/model/cacheTilesProcessor.js';
import {
  changesetsProcessor,
  changesetsTrackProcessor,
} from '@features/changesets/model/processor.js';
import { cookieConsentProcessor } from '@features/cookieConsent/model/processor.js';
import { dataViewerDensifyProcessor } from '@features/dataViewer/model/processors/dataViewerDensifyProcessor.js';
import { dataViewerDownloadTrackProcessor } from '@features/dataViewer/model/processors/dataViewerDownloadTrackProcessor.js';
import { dataViewerGpxLoadProcessor } from '@features/dataViewer/model/processors/dataViewerGpxLoadProcessor.js';
import { dataViewerResolveElevationPromptProcessor } from '@features/dataViewer/model/processors/dataViewerResolveElevationPromptProcessor.js';
import { dataViewerSetTrackDataProcessor } from '@features/dataViewer/model/processors/dataViewerSetTrackDataProcessor.js';
import {
  dataViewerForgetStoredProcessor,
  dataViewerRestoreStoredProcessor,
  dataViewerStoreProcessor,
} from '@features/dataViewer/model/processors/dataViewerStoreProcessors.js';
import { dataViewerToggleElevationChartProcessor } from '@features/dataViewer/model/processors/dataViewerToggleElevationChartProcessor.js';
import { elevationChartPendingTargetProcessor } from '@features/elevationChart/model/pendingTargetProcessor.js';
import { elevationChartProcessor } from '@features/elevationChart/model/processor.js';
import { galleryAllOfLicenseProcessor } from '@features/gallery/model/processors/galleryAllOfLicenseProcessor.js';
import { galleryDeletePictureProcessor } from '@features/gallery/model/processors/galleryDeletePictureProcessor.js';
import { galleryFetchUsersProcessor } from '@features/gallery/model/processors/galleryFetchUsersProcessor.js';
import { galleryItemUploadProcessor } from '@features/gallery/model/processors/galleryItemUploadProcessor.js';
import { galleryMakeAllPremiumOrFreeProcessor } from '@features/gallery/model/processors/galleryMakeAllPremiumOrFreeProcessor.js';
import { galleryQuickAddTagProcessor } from '@features/gallery/model/processors/galleryQuickAddTagProcessor.js';
import { galleryRequestImageProcessor } from '@features/gallery/model/processors/galleryRequestImageProcessor.js';
import { galleryRequestImagesByOrderProcessor } from '@features/gallery/model/processors/galleryRequestImagesByOrderProcessor.js';
import { galleryRequestImagesByRadiusProcessor } from '@features/gallery/model/processors/galleryRequestImagesByRadiusProcessor.js';
import { gallerySavePictureProcessor } from '@features/gallery/model/processors/gallerySavePictureProcessor.js';
import { gallerySetItemForPositionPickingProcessor } from '@features/gallery/model/processors/gallerySetItemForPositionPickingProcessor.js';
import { galleryShowImageGaProcessor } from '@features/gallery/model/processors/galleryShowImageGaProcessor.js';
import { galleryShowOnTheMapProcessor } from '@features/gallery/model/processors/galleryShowOnTheMapProcessor.js';
import { gallerySubmitCommentProcessor } from '@features/gallery/model/processors/gallerySubmitCommentProcessor.js';
import { gallerySubmitStarsProcessor } from '@features/gallery/model/processors/gallerySubmitStarsProcessor.js';
import { galleryUploadModalProcessor } from '@features/gallery/model/processors/galleryUploadModalProcessor.js';
import { geoipProcessor } from '@features/geoip/model/processors/geoIpProcessor.js';
import {
  gpsRecorderClearProcessor,
  gpsRecorderPauseProcessor,
  gpsRecorderPushedStatusProcessor,
  gpsRecorderStartProcessor,
  gpsRecorderStopProcessor,
  gpsRecorderSyncProcessor,
} from '@features/gpsRecorder/model/processors.js';
import { l10nSetLanguageProcessor } from '@features/l10n/model/processor.js';
import { legendProcessor } from '@features/legend/model/legendProcessor.js';
import { followLocationProcessor } from '@features/location/model/followProcessor.js';
import { locateProcessor } from '@features/location/model/locateProcessor.js';
import { getCountriesProcessor } from '@features/map/model/processors/getCountriesProcessor.js';
import { mapFitBboxProcessor } from '@features/map/model/processors/mapFitBboxProcessor.js';
import { mapRefocusProcessor } from '@features/map/model/processors/mapRefocusProcessor.js';
import { mapTypeGaProcessor } from '@features/map/model/processors/mapTypeGaProcessor.js';
import { exportMapFeaturesProcessor } from '@features/mapFeaturesExport/model/processors/exportMapFeaturesProcessor.js';
import { measurementProcessor } from '@features/measurement/model/measurementProcessor.js';
import { mapsDeleteProcessor } from '@features/myMaps/model/processors/mapsDeleteProcessor.js';
import { mapsLoadListProcessor } from '@features/myMaps/model/processors/mapsLoadListProcessor.js';
import { mapsLoadProcessor } from '@features/myMaps/model/processors/mapsLoadProcessor.js';
import {
  mapsOfflinePurgeProcessor,
  mapsSetAllOfflineProcessor,
  mapsSetMapOfflineProcessor,
} from '@features/myMaps/model/processors/mapsOfflineProcessor.js';
import { mapsRestoreProcessor } from '@features/myMaps/model/processors/mapsRestoreProcessor.js';
import { mapsSaveProcessor } from '@features/myMaps/model/processors/mapsSaveProcessor.js';
import { mapsWorkingCopyProcessor } from '@features/myMaps/model/processors/mapsWorkingCopyProcessor.js';
import {
  objectsChangePredicateProcessor,
  objectsFetchProcessor,
} from '@features/objects/model/objectsFetchProcessor.js';
import { downloadMapProcessor } from '@features/offlineMapExport/model/downloadMapProcessor.js';
import { openInExternalAppProcessor } from '@features/openInExternalApp/openInExternalAppProcessor.js';
import { osmLoadNodeProcessor } from '@features/osm/model/processors/osmLoadNodeProcessor.js';
import { osmLoadRelationProcessor } from '@features/osm/model/processors/osmLoadRelationProcessor.js';
import { osmLoadWayProcessor } from '@features/osm/model/processors/osmLoadWayProcessor.js';
import { purchaseProcessor } from '@features/purchases/model/processors/purchaseProcessor.js';
import { routePlannerColorizeProcessor } from '@features/routePlanner/model/processors/colorizeProcessor.js';
import { routePlannerFindRouteProcessor } from '@features/routePlanner/model/processors/findRouteProcessor.js';
import { routePlannerOptimizeOrderProcessor } from '@features/routePlanner/model/processors/optimizeOrderProcessor.js';
import { routePlannerRefocusMapProcessor } from '@features/routePlanner/model/processors/refocusMapProcessor.js';
import { routePlannerSetFromCurrentPositionProcessor } from '@features/routePlanner/model/processors/setFromCurrentPositionProcessor.js';
import * as rpcProcessors from '@features/rpc/model/processors.js';
import {
  searchHighlightProcessor,
  searchHighlightTrafo,
} from '@features/search/model/processors/searchHighlightProcessor.js';
import { searchProcessor } from '@features/search/model/processors/searchProcessor.js';
import { toastsAddProcessor } from '@features/toasts/model/processors/toastsAddProcessor.js';
import { toastsCancelTypeProcessor } from '@features/toasts/model/processors/toastsCancelTypeProcessor.js';
import { toastsRemoveProcessor } from '@features/toasts/model/processors/toastsRemoveProcessor.js';
import { toastsRestartTimeoutProcessor } from '@features/toasts/model/processors/toastsRestartTimeoutProcessor.js';
import { toastsStopTimeoutProcessor } from '@features/toasts/model/processors/toastsStopTimeoutProcessor.js';
import * as trackingAccessTokenProcessors from '@features/tracking/model/processors/trackingAccessTokenProcessors.js';
import * as trackingDeviceProcessors from '@features/tracking/model/processors/trackingDeviceProcessors.js';
import { trackingFollowProcessor } from '@features/tracking/model/processors/trackingFollowProcessors.js';
import { wikiLayerProcessor } from '@features/wiki/model/processors/wikiLayerProcessor.js';
import { wikiLoadPreviewProcessor } from '@features/wiki/model/processors/wikiLoadPreviewProcessor.js';
import { cancelProcessor } from '@/processors/cancelProcessor.js';
import { convertToDrawingProcessor } from '@/processors/convertToDrawingProcessor.js';
import { deleteProcessor } from '@/processors/deleteProcessor.js';
import { errorProcessor } from '@/processors/errorProcessor.js';
import { legacyMapWarningProcessor } from '@/processors/legacyMapWarningProcessor.js';
import { resetAppProcessor } from '@/processors/resetAppProcessor.js';
import { saveSettingsProcessor } from '@/processors/saveSettingsProcessor.js';
import { setActiveModalTransformer } from '@/processors/setActiveModalProcessor.js';
import { setToolProcessor } from '@/processors/setToolProcessor.js';
import { urlProcessor } from '../url/urlProcessor.js';

export const processors = [
  errorProcessor,
  toastsCancelTypeProcessor,
  cancelProcessor,
  setToolProcessor,
  deleteProcessor,
  geoipProcessor,
  convertToDrawingProcessor,
  cookieConsentProcessor,
  authLogoutProcessor,
  authDisconnectProcessor,
  authDeleteAccountProcessor,
  mapRefocusProcessor,
  mapFitBboxProcessor,
  getCountriesProcessor,
  searchProcessor,
  searchHighlightTrafo,
  searchHighlightProcessor,
  locateProcessor,
  followLocationProcessor,
  saveSettingsProcessor,
  resetAppProcessor,
  measurementProcessor,
  changesetsProcessor,
  changesetsTrackProcessor,
  authInitProcessor,
  authTrackProcessor,
  l10nSetLanguageProcessor,
  elevationChartProcessor,
  elevationChartPendingTargetProcessor,
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
  dataViewerSetTrackDataProcessor,
  dataViewerStoreProcessor,
  dataViewerForgetStoredProcessor,
  dataViewerRestoreStoredProcessor,
  dataViewerDownloadTrackProcessor,
  dataViewerGpxLoadProcessor,
  dataViewerToggleElevationChartProcessor,
  dataViewerResolveElevationPromptProcessor,
  dataViewerDensifyProcessor,
  routePlannerFindRouteProcessor,
  routePlannerOptimizeOrderProcessor,
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
  galleryAllOfLicenseProcessor,
  routePlannerRefocusMapProcessor,
  routePlannerColorizeProcessor,
  routePlannerSetFromCurrentPositionProcessor,
  ...Object.values(trackingAccessTokenProcessors),
  ...Object.values(trackingDeviceProcessors),
  trackingFollowProcessor,
  gpsRecorderStartProcessor,
  gpsRecorderPauseProcessor,
  gpsRecorderStopProcessor,
  gpsRecorderSyncProcessor,
  gpsRecorderPushedStatusProcessor,
  gpsRecorderClearProcessor,
  setActiveModalTransformer,
  mapsLoadListProcessor,
  mapsLoadProcessor,
  mapsDeleteProcessor,
  mapsSaveProcessor,
  mapsWorkingCopyProcessor,
  mapsRestoreProcessor,
  mapsSetMapOfflineProcessor,
  mapsSetAllOfflineProcessor,
  mapsOfflinePurgeProcessor,
  wikiLayerProcessor,
  wikiLoadPreviewProcessor,
  legendProcessor,
  legacyMapWarningProcessor,
  openInExternalAppProcessor,
  ...Object.values(rpcProcessors),
  exportMapFeaturesProcessor,
  ...authProcessors,
  downloadMapProcessor,
  purchaseProcessor,
  cacheTilesStartProcessor,
  cacheTilesRestartProcessor,
  cacheTilesPauseProcessor,
  cacheTilesResumeProcessor,
  cacheTilesCancelProcessor,
  cachedMapDeletedProcessor,
  cachedMapRenamedProcessor,
  urlProcessor,
];
