import { createLogic } from 'redux-logic';
import { timeoutMap } from 'fm3/logic/toasts';

export default createLogic({
  type: 'TOASTS_STOP_TIMEOUT',
  process({ action: { payload: id } }) {
    const tm = timeoutMap.get(id);
    if (tm) {
      clearTimeout(tm.timeoutId);
      tm.timeoutId = null;
    }
  },
});

