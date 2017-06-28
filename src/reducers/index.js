import { combineReducers } from 'redux';

import main from 'fm3/reducers/mainReducer';
import map from 'fm3/reducers/mapReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';
import areaMeasurement from 'fm3/reducers/areaMeasurementReducer';
import distanceMeasurement from 'fm3/reducers/distanceMeasurementReducer';
import elevationMeasurement from 'fm3/reducers/elevationMeasurementReducer';
import infoPoint from 'fm3/reducers/infoPointReducer';
import objects from 'fm3/reducers/objectsReducer';
import search from 'fm3/reducers/searchReducer';
import trackViewer from 'fm3/reducers/trackViewerReducer';
import toasts from 'fm3/reducers/toastsReducer';
import elevationChart from 'fm3/reducers/elevationChartReducer';
import gallery from 'fm3/reducers/galleryReducer';
import changesets from 'fm3/reducers/changesetsReducer';
import auth from 'fm3/reducers/authReducer';

export default combineReducers({
  main,
  map,
  routePlanner,
  areaMeasurement,
  distanceMeasurement,
  elevationMeasurement,
  infoPoint,
  objects,
  search,
  trackViewer,
  toasts,
  elevationChart,
  gallery,
  changesets,
  auth,
});
