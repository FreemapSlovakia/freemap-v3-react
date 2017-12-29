import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { routePlannerSetTransportType } from 'fm3/actions/routePlannerActions';

export default createLogic({
  type: at.SET_TOOL,
  process({ getState }, dispatch, done) {
    const { main: { tool }, routePlanner: { transportType, start, finish } } = getState();
    if (tool === 'route-planner' && (!transportType) || !start && !finish) {
      const { mapType } = getState().map;
      dispatch(routePlannerSetTransportType(
        mapType === 'T' ? 'foot' : mapType === 'K' ? 'nordic' : ['C', 'M'].includes(mapType) ? 'bike' : 'car'));
    }

    done();
  },
});
