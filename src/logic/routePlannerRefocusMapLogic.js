import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import { mapRefocus } from 'fm3/actions/mapActions';

export default createLogic({
  type: [at.ROUTE_PLANNER_SET_START, at.ROUTE_PLANNER_SET_FINISH],
  process({ getState, action }, dispatch, done) {
    const { routePlanner: { start, finish } } = getState();
    let focusPoint;
    if (action.type === at.ROUTE_PLANNER_SET_START) {
      focusPoint = start;
    } else if (action.type === at.ROUTE_PLANNER_SET_FINISH) {
      focusPoint = finish;
    }

    if (focusPoint && !getMapLeafletElement().getBounds().contains(L.latLng(focusPoint.lat, focusPoint.lon))) {
      dispatch(mapRefocus({ lat: focusPoint.lat, lon: focusPoint.lon }));
    }

    done();
  },
});
