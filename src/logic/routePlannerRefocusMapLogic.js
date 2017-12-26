import { createLogic } from 'redux-logic';

import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import { mapRefocus } from 'fm3/actions/mapActions';

export default createLogic({
  type: [
    'ROUTE_PLANNER_SET_START',
    'ROUTE_PLANNER_SET_FINISH',
  ],
  process({ getState, action }, dispatch, done) {
    const { routePlanner: { start, finish } } = getState();
    let focusPoint;
    if (action.type === 'ROUTE_PLANNER_SET_START') {
      focusPoint = start;
    } else if (action.type === 'ROUTE_PLANNER_SET_FINISH') {
      focusPoint = finish;
    }

    if (!getMapLeafletElement().getBounds().contains(L.latLng(focusPoint.lat, focusPoint.lon))) {
      dispatch(mapRefocus({ lat: focusPoint.lat, lon: focusPoint.lon }));
    }

    done();
  },
});
