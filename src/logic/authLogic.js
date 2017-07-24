import { createLogic } from 'redux-logic';

import { authSetUser } from 'fm3/actions/authActions';
import { setHomeLocation, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';

import { API_URL } from 'fm3/backendDefinitions';

// const checkLoginLogic = createLogic({
//   type: 'AUTH_CHECK_LOGIN',
//   process: processGetUser.bind(null, false),
// });

const authLoginLogic = createLogic({
  type: 'AUTH_LOGIN',
  cancelType: 'AUTH_LOGIN',
  warnTimeout: 0, // can take forever
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const w = window.open('about:blank', 'osm-login',
      `width=600,height=550,left=${screen.width / 2 - 600 / 2},top=${screen.height / 2 - 550 / 2}`);

    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'applicaction/json',
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

    // auth.authenticate((err) => {
    //   // NOTE callback may never be called (eg if user simply closes popup)
    //   if (err) {
    //     dispatch(toastsAddError(`Chyba prihlásenia: ${err.message}`));
    //     done();
    //   } else {
    //     processGetUser(true, params, dispatch, done); // TODO show success toast
    //   }
    // });
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

// const authLogoutLogic = createLogic({
//   type: 'AUTH_LOGOUT',
//   process(_, dispatch, done) {
//     auth.logout();
//     dispatch(toastsAdd({
//       collapseKey: 'login',
//       message: 'Boli ste odhlásený.',
//       style: 'info',
//       timeout: 5000,
//     }));
//     done();
//   },
// });

export default [authLoginLogic];
