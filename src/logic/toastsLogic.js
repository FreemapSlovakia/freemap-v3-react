import { createLogic } from 'redux-logic';
import { toastsRemove } from 'fm3/actions/toastsActions';

const timeoutMap = new Map();

export const toastsAddLogic = createLogic({
  type: 'TOASTS_ADD',
  process({ getState, action: { payload: { timeout, id, collapseKey } } }, dispatch, done) {
    if (collapseKey) {
      const toast = getState().toasts.toasts.find(t => t.collapseKey === collapseKey);
      if (toast) {
        removeTimeout(toast.id);
      }
    }

    if (typeof timeout === 'number') {
      setupTimeout(id, timeout, dispatch, done);
    } else {
      done();
    }
  },
});

export const toastsRemoveLogic = createLogic({
  type: 'TOASTS_REMOVE',
  process({ action: { payload: id } }) {
    removeTimeout(id);
  },
});

export const toastsStopTimeoutLogic = createLogic({
  type: 'TOASTS_STOP_TIMEOUT',
  process({ action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      clearTimeout(tm.timeoutId);
      tm.timeoutId = null;
    }
  },
});

export const toastsRestartTimeoutLogic = createLogic({
  type: 'TOASTS_RESTART_TIMEOUT',
  process({ getState, action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      timeoutMap.delete(id);
      if (tm.timeoutId) {
        clearTimeout(tm.timeoutId);
      }

      const toast = getState().toasts.toasts.find(t => t.id === id);
      if (toast && typeof toast.timeout === 'number') {
        setupTimeout(id, toast.timeout, tm.dispatch, tm.done);
      } else {
        // unexpected
        tm.done();
      }
    }
  },
});

export const toastsCancelTypeLogic = createLogic({
  type: '*',
  process({ getState, action: { type } }, dispatch, done) {
    getState().toasts.toasts.filter(({ cancelType }) => matches(type, cancelType)).forEach(({ id }) => {
      dispatch(toastsRemove(id));
    });
    done();
  },
});

function setupTimeout(id, timeout, dispatch, done) {
  const timeoutId = setTimeout(() => {
    timeoutMap.delete(id);
    dispatch(toastsRemove(id));
    done();
  }, timeout);

  timeoutMap.set(id, {
    timeoutId,
    done,
    dispatch,
  });
}

function removeTimeout(id) {
  const tm = timeoutMap.get(id);
  if (tm) {
    timeoutMap.delete(id);
    clearTimeout(tm.timeoutId);
    tm.done();
  }
}

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

export default [
  toastsAddLogic,
  toastsRemoveLogic,
  toastsStopTimeoutLogic,
  toastsRestartTimeoutLogic,
  toastsCancelTypeLogic,
];
