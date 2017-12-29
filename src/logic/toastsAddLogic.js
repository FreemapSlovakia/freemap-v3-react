import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { setupTimeout, removeTimeout } from 'fm3/logic/toasts';

export default createLogic({
  type: at.TOASTS_ADD,
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
