import { createLogic } from 'redux-logic';
import osmAuth from 'osm-auth';

import { authSetUser } from 'fm3/actions/authActions';
// TODO import { toastsAdd, toastsAddError } from 'fm3/actions/toastActions';

const auth = osmAuth({
  oauth_consumer_key: 'XsCiIfvjfhS6iBNR30H29ymmgRYAb3j98kjOyCUu',
  oauth_secret: 'eASOhF36wPcsRXPMS7baat26KCX2TsL2UHK7qAWV',
});

const checkLoginLogic = createLogic({
  type: 'CHECK_LOGIN',
  process: processGetUser,
});

const authLoginLogic = createLogic({
  type: 'AUTH_LOGIN',
  process(params, dispatch, done) {
    auth.authenticate((err) => {
      if (err) {
        // TODO show error toast
        done();
      } else {
        processGetUser(params, dispatch, done);
      }
    });
  },
});

// TODO show toast on success/error
function processGetUser(_, dispatch, done) {
  // TODO progress
  auth.xhr({
    method: 'GET',
    path: '/api/0.6/user/details',
  }, (err, details) => {
    if (details) {
      const x = document.evaluate('/osm/user/@display_name', details, null, XPathResult.STRING_TYPE, null);
      dispatch(authSetUser(x.stringValue));
    } else {
      dispatch(authSetUser(null));
    }
    done();
  });
}

const authLogoutLogic = createLogic({
  type: 'AUTH_LOGOUT',
  process() {
    auth.logout();
  },
});

export default [checkLoginLogic, authLoginLogic, authLogoutLogic];
