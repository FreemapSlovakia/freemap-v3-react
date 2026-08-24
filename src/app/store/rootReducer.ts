import { authReducer } from '@features/auth/model/reducer.js';
import { cachedMapsReducer } from '@features/cachedMaps/model/reducer.js';
import { cachedMapsSettingsReducer } from '@features/cachedMaps/model/settingsReducer.js';
import { changesetReducer } from '@features/changesets/model/reducer.js';
import { cookieConsentReducer } from '@features/cookieConsent/model/reducer.js';
import { dataViewerReducer } from '@features/dataViewer/model/reducer.js';
import { dataViewerSettingsReducer } from '@features/dataViewer/model/settingsReducer.js';
import { drawingLinesReducer } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import { drawingPointsReducer } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import { drawingSettingsReducer } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { elevationChartReducer } from '@features/elevationChart/model/reducer.js';
import { elevationSettingsReducer } from '@features/elevationChart/model/settingsReducer.js';
import { galleryReducer } from '@features/gallery/model/reducer.js';
import { gallerySettingsReducer } from '@features/gallery/model/settingsReducer.js';
import { geoIpReducer } from '@features/geoip/model/reducer.js';
import { gpsRecorderReducer } from '@features/gpsRecorder/model/reducer.js';
import { gpsRecorderSettingsReducer } from '@features/gpsRecorder/model/settingsReducer.js';
import { homeLocationReducer } from '@features/homeLocation/model/reducer.js';
import { l10nReducer } from '@features/l10n/model/reducer.js';
import { locationReducer } from '@features/location/model/reducer.js';
import { locationSettingsReducer } from '@features/location/model/settingsReducer.js';
import { mapReducer } from '@features/map/model/reducer.js';
import { mapAreaReducer } from '@features/mapArea/model/reducer.js';
import { mapDetailsReducer } from '@features/mapDetails/model/reducer.js';
import { mapsReducer } from '@features/myMaps/model/reducer.js';
import { objectsReducer } from '@features/objects/model/reducer.js';
import { objectsSettingsReducer } from '@features/objects/model/settingsReducer.js';
import { panoramaReducer } from '@features/panorama/model/reducer.js';
import { panoramaSettingsReducer } from '@features/panorama/model/settingsReducer.js';
import { progressReducer } from '@features/progress/model/reducer.js';
import { routePlannerReducer } from '@features/routePlanner/model/reducer.js';
import { routePlannerSettingsReducer } from '@features/routePlanner/model/settingsReducer.js';
import { searchReducer } from '@features/search/model/reducer.js';
import { searchSettingsReducer } from '@features/search/model/settingsReducer.js';
import { toastsReducer } from '@features/toasts/model/reducer.js';
import { toposcopeReducer } from '@features/toposcope/model/reducer.js';
import { trackingReducer } from '@features/tracking/model/reducer.js';
import { trackingSettingsReducer } from '@features/tracking/model/settingsReducer.js';
import { viewshedReducer } from '@features/viewshed/model/reducer.js';
import { viewshedSettingsReducer } from '@features/viewshed/model/settingsReducer.js';
import { weatherRadarReducer } from '@features/weatherRadar/model/reducer.js';
import { weatherRadarSettingsReducer } from '@features/weatherRadar/model/settingsReducer.js';
import { websocketReducer } from '@features/websocket/model/reducer.js';
import { wikiReducer } from '@features/wiki/model/reducer.js';
import { mainReducer } from './reducer.js';

export { getInitialState } from './persistence.js';

export const reducers = {
  auth: authReducer,
  cachedMaps: cachedMapsReducer,
  cachedMapsSettings: cachedMapsSettingsReducer,
  changesets: changesetReducer,
  cookieConsent: cookieConsentReducer,
  drawingSettings: drawingSettingsReducer,
  drawingLines: drawingLinesReducer,
  drawingPoints: drawingPointsReducer,
  elevationChart: elevationChartReducer,
  elevationSettings: elevationSettingsReducer,
  geoip: geoIpReducer,
  gallery: galleryReducer,
  gallerySettings: gallerySettingsReducer,
  gpsRecorder: gpsRecorderReducer,
  gpsRecorderSettings: gpsRecorderSettingsReducer,
  homeLocation: homeLocationReducer,
  l10n: l10nReducer,
  location: locationReducer,
  locationSettings: locationSettingsReducer,
  main: mainReducer,
  mapDetails: mapDetailsReducer,
  mapArea: mapAreaReducer,
  map: mapReducer,
  objects: objectsReducer,
  objectsSettings: objectsSettingsReducer,
  panorama: panoramaReducer,
  panoramaSettings: panoramaSettingsReducer,
  progress: progressReducer,
  routePlanner: routePlannerReducer,
  routePlannerSettings: routePlannerSettingsReducer,
  search: searchReducer,
  searchSettings: searchSettingsReducer,
  toasts: toastsReducer,
  toposcope: toposcopeReducer,
  tracking: trackingReducer,
  trackingSettings: trackingSettingsReducer,
  trackViewer: dataViewerReducer,
  trackViewerSettings: dataViewerSettingsReducer,
  viewshed: viewshedReducer,
  viewshedSettings: viewshedSettingsReducer,
  weatherRadar: weatherRadarReducer,
  weatherRadarSettings: weatherRadarSettingsReducer,
  websocket: websocketReducer,
  myMaps: mapsReducer,
  wiki: wikiReducer,
};
