import { createLogic } from 'redux-logic';
import osmAuth from 'osm-auth';

import { authSetUser } from 'fm3/actions/authActions';
import { setHomeLocation } from 'fm3/actions/mainActions';
// TODO import { toastsAdd, toastsAddError } from 'fm3/actions/toastActions';

const auth = osmAuth({
  oauth_consumer_key: 'XsCiIfvjfhS6iBNR30H29ymmgRYAb3j98kjOyCUu',
  oauth_secret: 'eASOhF36wPcsRXPMS7baat26KCX2TsL2UHK7qAWV',
});

const checkLoginLogic = createLogic({
  type: 'AUTH_CHECK_LOGIN',
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
function processGetUser({ getState }, dispatch, done) {
  // TODO progress
  auth.xhr({
    method: 'GET',
    path: '/api/0.6/user/details',
  }, (err, details) => {
    if (details) {
      const lat = parseFloat(getString(details, '/osm/user/home/@lat'));
      const lon = parseFloat(getString(details, '/osm/user/home/@lon'));
      dispatch(authSetUser({
        id: parseInt(getString(details, '/osm/user/@id'), 10),
        name: getString(details, '/osm/user/@display_name'),
      }));

      if (!getState().main.homeLocation) {
        dispatch(setHomeLocation({ lat, lon }));
      }
    } else {
      dispatch(authSetUser(null));
    }
    done();
  });
}

function getString(doc, xpath) {
  const x = document.evaluate(xpath, doc, null, XPathResult.STRING_TYPE, null);
  return x && x.stringValue;
}

const authLogoutLogic = createLogic({
  type: 'AUTH_LOGOUT',
  process() {
    auth.logout();
  },
});

export default [checkLoginLogic, authLoginLogic, authLogoutLogic];
