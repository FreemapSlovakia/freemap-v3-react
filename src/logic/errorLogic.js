import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { errorSetTicketId } from 'fm3/actions/errorActions';

export default createLogic({
  type: [at.ERROR_COMPONENT_ERROR, at.ERROR_REDUCING_ERROR, at.UNHANDLED_LOGIC_ERROR],
  process({ getState, action }, dispatch, done) {
    const s = getState();
    const state = { ...s, l10n: { ...s.l10n, translations: null } };

    axios.post(
      `${process.env.API_URL}/logger`,
      {
        level: 'error',
        message: 'Global webapp error.',
        details: {
          action,
          url: window.location.href,
          userAgent: navigator.userAgent,
          localStorage,
          state,
        },
      },
      {
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        dispatch(errorSetTicketId(data.id));
      })
      .catch(() => {})
      .then(() => {
        done();
      });
  },
});
