import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { timeoutMap } from 'fm3/logic/toasts';

export default createLogic({
  type: at.TOASTS_STOP_TIMEOUT,
  process({ action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      clearTimeout(tm.timeoutId);
      tm.timeoutId = null;
    }
  },
});

