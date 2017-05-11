import routePlannerLogic from 'fm3/logic/routePlannerLogic';
import elevationMeasurementLogic from 'fm3/logic/elevationMeasurementLogic';
import objectsLogic from 'fm3/logic/objectsLogic';
import searchLogic from 'fm3/logic/searchLogic';
import storageLogic from 'fm3/logic/storageLogic';
import locateLogic from 'fm3/logic/locateLogic';
import trackViewerLogic from 'fm3/logic/trackViewerLogic';
import distanceMeasurementExportGpxLogic from 'fm3/logic/distanceMeasurementLogic';
import toastsLogic from 'fm3/logic/toastsLogic';

export default [
  ...routePlannerLogic,
  elevationMeasurementLogic,
  searchLogic,
  ...objectsLogic,
  storageLogic,
  locateLogic,
  trackViewerLogic,
  distanceMeasurementExportGpxLogic,
  ...toastsLogic,
];
