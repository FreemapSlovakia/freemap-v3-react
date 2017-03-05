import { combineReducers } from 'redux';

import main from 'fm3/reducers/mainReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';
import elevationMeasurement from 'fm3/reducers/elevationMeasurementReducer';

export default combineReducers({ main, routePlanner, elevationMeasurement });
