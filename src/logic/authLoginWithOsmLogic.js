import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.AUTH_LOGIN_WITH_OSM,
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const w = window.open(
      'about:blank',
      'osm-login',
      `width=600,height=550,left=${window.screen.width / 2 -
        600 / 2},top=${window.screen.height / 2 - 550 / 2}`,
    );

    axios(`${process.env.API_URL}/auth/login`, {
      method: 'post',
      validateStatus: status => status === 200,
    })
      .then(({ data }) => {
        if (data.redirect) {
          w.location = data.redirect;
        }
      })
      .catch(err => {
        dispatch(toastsAddError('logIn.logInError', err));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
