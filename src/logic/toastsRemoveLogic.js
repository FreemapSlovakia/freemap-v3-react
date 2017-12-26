import { createLogic } from 'redux-logic';
import { removeTimeout } from 'fm3/logic/toasts';

export default createLogic({
  type: 'TOASTS_REMOVE',
  process({ action: { payload: id } }) {
    removeTimeout(id);
  },
});
