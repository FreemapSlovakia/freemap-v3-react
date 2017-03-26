import { createLogic } from 'redux-logic';

export default createLogic({
  type: 'MEASUREMENT_ADD_POINT',
  transform({ getState, action }, next) {
    const { points } = getState().measurement;
    const position = points.length;
    next({ ...action, payload: { ...action.payload, position } });
  },
});
