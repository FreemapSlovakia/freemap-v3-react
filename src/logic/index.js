import routePlannerLogic from 'fm3/logic/routePlannerLogic';
import elevationMeasurementLogic from 'fm3/logic/elevationMeasurementLogic';
import objectsLogic from 'fm3/logic/objectsLogic';
import searchLogic from 'fm3/logic/searchLogic';

export default [
  routePlannerLogic,
  elevationMeasurementLogic,
  ...objectsLogic,
  ...searchLogic
];
