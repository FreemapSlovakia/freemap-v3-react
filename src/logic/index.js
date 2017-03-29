import routePlannerLogic from 'fm3/logic/routePlannerLogic';
import elevationMeasurementLogic from 'fm3/logic/elevationMeasurementLogic';
import objectsLogic from 'fm3/logic/objectsLogic';
import searchLogic from 'fm3/logic/searchLogic';
import storageLogic from 'fm3/logic/storageLogic';
import locateLogic from 'fm3/logic/locateLogic';

export default [
  ...routePlannerLogic,
  elevationMeasurementLogic,
  searchLogic,
  ...objectsLogic,
  storageLogic,
  locateLogic,
];
