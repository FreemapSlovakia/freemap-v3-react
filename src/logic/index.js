import routePlannerLogic from 'fm3/logic/routePlannerLogic';
import elevationMeasurementLogic from 'fm3/logic/elevationMeasurementLogic';
import objectsLogic from 'fm3/logic/objectsLogic';
import searchLogic from 'fm3/logic/searchLogic';
import mapLogic from 'fm3/logic/mapLogic';

export default [
  ...routePlannerLogic,
  elevationMeasurementLogic,
  objectsLogic, 
  ...searchLogic,
  mapLogic
];
