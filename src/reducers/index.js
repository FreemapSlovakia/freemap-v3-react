import { combineReducers } from 'redux';

import main from 'fm3/reducers/mainReducer';
import map from 'fm3/reducers/mapReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';
import measurement from 'fm3/reducers/measurementReducer';
import elevationMeasurement from 'fm3/reducers/elevationMeasurementReducer';
import objects from 'fm3/reducers/objectsReducer';
import search from 'fm3/reducers/searchReducer';
import trackViewer from 'fm3/reducers/trackViewerReducer';

export default combineReducers({ main, map, routePlanner, measurement, elevationMeasurement, objects, search, trackViewer });
