import { combineReducers } from 'redux';

import main from 'fm3/reducers/mainReducer';
import routePlanner from 'fm3/reducers/routePlannerReducer';

export default combineReducers({ main, routePlanner });
