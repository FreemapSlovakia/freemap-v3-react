import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { timeoutMap, setupTimeout } from 'fm3/logic/toasts';

export default createLogic({
  type: at.TOASTS_RESTART_TIMEOUT,
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
