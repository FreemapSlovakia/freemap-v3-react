import { createLogic } from 'redux-logic';
import storage from 'fm3/storage';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.ROUTE_PLANNER_PREVENT_HINT,
  process(_, dispatch, done) {
    storage.setItem('routePlannerPreventHint', '1');
    done();
  },
});
