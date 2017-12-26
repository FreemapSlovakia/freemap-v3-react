import { createLogic } from 'redux-logic';
import { toastsRemove } from 'fm3/actions/toastsActions';

export default createLogic({
  type: '*',
  process({ getState, action: { type } }, dispatch, done) {
    getState().toasts.toasts.filter(({ cancelType }) => matches(type, cancelType)).forEach(({ id }) => {
      dispatch(toastsRemove(id));
    });
    done();
  },
});

function matches(value, test) {
  if (test === null || test === undefined) {
    return false;
  } else if (typeof test === 'string') {
    return value === test;
  } else if (Array.isArray(test)) {
    return test.some(p => matches(value, p));
  } else if (test instanceof RegExp) {
    return test.test(value);
  }
  throw new Error('unsupported test value');
}
