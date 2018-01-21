import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';
import { toastsAdd } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.SET_ERROR_TICKET_ID,
  process({ action }, dispatch, done) {
    dispatch(toastsAdd({
      messageKey: 'general.internalError',
      messageParams: { ticketId: action.payload.toString() },
      style: 'danger',
    }));
    done();
  },
});
