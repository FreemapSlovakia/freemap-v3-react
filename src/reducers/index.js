import { combineReducers } from 'redux';

import main from 'fm3/reducers/mainReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';
import measurement from 'fm3/reducers/measurementReducer';
import elevationMeasurement from 'fm3/reducers/elevationMeasurementReducer';

export default combineReducers({ main, routePlanner, measurement, elevationMeasurement });
