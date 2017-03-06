import { combineReducers } from 'redux';

import map from 'fm3/reducers/mapReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';
import measurement from 'fm3/reducers/measurementReducer';
import elevationMeasurement from 'fm3/reducers/elevationMeasurementReducer';
import objects from 'fm3/reducers/objectsReducer';

export default combineReducers({ map, routePlanner, measurement, elevationMeasurement, objects });
