import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.ROUTE_PLANNER_PREVENT_HINT,
  process(_, dispatch, done) {
    localStorage.setItem('routePlannerPreventHint', '1');
    done();
  },
});
