import { createLogic } from 'redux-logic';
import { removeTimeout } from 'fm3/logic/toasts';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.TOASTS_REMOVE,
  process({ action: { payload: id } }) {
    removeTimeout(id);
  },
});
