import { createLogic } from 'redux-logic';
import { toastsRemove } from 'fm3/actions/toastsActions';

const timeoutMap = new Map();

const logic1 = createLogic({
  type: 'TOASTS_ADD',
  process({ action: { payload: { timeout, id } } }, dispatch, done) {
    if (typeof timeout === 'number') {
      setupTimeout(id, timeout, dispatch, done);
    } else {
      done();
    }
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

const logic2 = createLogic({
  type: 'TOASTS_REMOVE',
  process({ action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      timeoutMap.delete(id);
      clearTimeout(tm.timeoutId);
      tm.done();
    }
  },
});

const logic3 = createLogic({
  type: 'TOASTS_STOP_TIMEOUT',
  process({ action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      clearTimeout(tm.timeoutId);
      tm.timeoutId = null;
    }
  },
});

const logic4 = createLogic({
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

export default [logic1, logic2, logic3, logic4];
