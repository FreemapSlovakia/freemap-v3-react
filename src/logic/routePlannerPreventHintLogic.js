import { createLogic } from 'redux-logic';

export default createLogic({
  type: 'ROUTE_PLANNER_PREVENT_HINT',
  process(_, dispatch, done) {
    localStorage.setItem('routePlannerPreventHint', '1');
    done();
  },
});
