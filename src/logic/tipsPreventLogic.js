import { createLogic } from 'redux-logic';
import axios from 'axios';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.TIPS_PREVENT_NEXT_TIME,
  process({ getState }, dispatch, done) {
    localStorage.setItem('preventTips', getState().tips.preventTips);

    if (!getState().auth.user) {
      done();
      return;
    }

    axios.patch(
      `${process.env.API_URL}/auth/settings`,
      {
        preventTips: getState().tips.preventTips,
      },
      {
        headers: {
          Authorization: `Bearer ${getState().auth.user.authToken}`,
        },
        validateStatus: status => status === 204,
        // cancelToken: source.token,
      },
    )
      .catch(() => {
        // TODO dispatch(toastsAddError(`Nastala chyba pri ukladaní nastavenia: ${e.message}`));
      })
      .then(() => {
        // TODO storeDispatch(stopProgress(pid));
        done();
      });
  },
});
