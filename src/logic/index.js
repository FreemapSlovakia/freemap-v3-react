import routePlannerLogic from 'fm3/logic/routePlannerLogic';
import elevationChartLogic from 'fm3/logic/elevationChartLogic';
import elevationMeasurementLogic from 'fm3/logic/elevationMeasurementLogic';
import objectsLogic from 'fm3/logic/objectsLogic';
import searchLogic from 'fm3/logic/searchLogic';
import storageLogic from 'fm3/logic/storageLogic';
import locateLogic from 'fm3/logic/locateLogic';
import trackViewerLogic from 'fm3/logic/trackViewerLogic';
import distanceMeasurementExportGpxLogic from 'fm3/logic/distanceMeasurementLogic';
import toastsLogic from 'fm3/logic/toastsLogic';
import urlLogic from 'fm3/logic/urlLogic';
import galleryLogic from 'fm3/logic/galleryLogic';
import infoPointLogic from 'fm3/logic/infoPointLogic';
import changesetsLogic from 'fm3/logic/changesetsLogic';
import authLogic from 'fm3/logic/authLogic';

export default [
  ...routePlannerLogic,
  elevationChartLogic,
  elevationMeasurementLogic,
  searchLogic,
  ...objectsLogic,
  storageLogic,
  locateLogic,
  ...trackViewerLogic,
  distanceMeasurementExportGpxLogic,
  ...toastsLogic,
  urlLogic,
  ...galleryLogic,
  infoPointLogic,
  changesetsLogic,
  ...authLogic,
];
