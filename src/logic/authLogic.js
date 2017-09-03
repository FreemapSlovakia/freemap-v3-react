import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authLogout } from 'fm3/actions/authActions';

const authLoginLogic = createLogic({
  type: 'AUTH_LOGIN',
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const w = window.open('about:blank', 'osm-login',
      `width=600,height=550,left=${screen.width / 2 - 600 / 2},top=${screen.height / 2 - 550 / 2}`);

    fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data.redirect) {
          w.location = data.redirect;
        }
      })
      .catch((err) => {
        dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});


const authLogoutLogic = createLogic({
  type: 'AUTH_START_LOGOUT',
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
    })
      .then((res) => {
        if (res.status !== 204) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          localStorage.removeItem('authToken');
          dispatch(authLogout());
          dispatch(toastsAdd({
            collapseKey: 'login',
            message: 'Boli ste úspešne odhlásený.',
            style: 'info',
            timeout: 5000,
          }));
        }
      })
      .catch((err) => {
        dispatch(toastsAddError(`Nepodarilo sa odhlásiť: ${err.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

// // TODO show toast on success/error
// function processGetUser(afterLogin, { getState }, dispatch, done) {
//   const pid = Math.random();
//   dispatch(startProgress(pid));
//   auth.xhr({
//     method: 'GET',
//     path: '/api/0.6/user/details',
//   }, (err, details) => {
//     // TODO check error for special errors

//     dispatch(stopProgress(pid));
//     if (details) {
//       const lat = parseFloat(getString(details, '/osm/user/home/@lat'));
//       const lon = parseFloat(getString(details, '/osm/user/home/@lon'));
//       dispatch(authSetUser({
//         id: parseInt(getString(details, '/osm/user/@id'), 10),
//         name: getString(details, '/osm/user/@display_name'),
//       }));

//       if (!getState().main.homeLocation) {
//         dispatch(setHomeLocation({ lat, lon }));
//       }

//       if (afterLogin) {
//         dispatch(toastsAdd({
//           collapseKey: 'login',
//           message: 'Boli ste úspešne prihlásený.',
//           style: 'info',
//           timeout: 5000,
//         }));
//       }
//     } else {
//       dispatch(authSetUser(null));
//       if (afterLogin) {
//         dispatch(toastsAddError(`Nepodarilo sa načítať vaše údaje z OSM: ${err.message}`));
//       }
//     }
//     done();
//   });
// }

// function getString(doc, xpath) {
//   const x = document.evaluate(xpath, doc, null, XPathResult.STRING_TYPE, null);
//   return x && x.stringValue;
// }


export default [authLoginLogic, authLogoutLogic];
