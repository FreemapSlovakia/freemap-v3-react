import { setStore } from 'fm3/globalErrorHandler';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';

import Main from 'fm3/components/Main';
import ErrorCatcher from 'fm3/components/ErrorCatcher';

import {
  mainLoadState,
  enableUpdatingUrl,
  reloadApp,
} from 'fm3/actions/mainActions';
// import { errorSetError } from 'fm3/actions/errorActions';
import { mapLoadState, mapSetStravaAuth } from 'fm3/actions/mapActions';
import { trackViewerLoadState } from 'fm3/actions/trackViewerActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import history from 'fm3/historyHolder';
import { handleLocationChange } from 'fm3/locationChangeHandler';
import initAuthHelper from 'fm3/authHelper';
import 'fm3/googleAnalytics';
import 'fm3/fbLoader';
import createStore from 'fm3/storeCreator';
import storage from 'fm3/storage';

import 'font-awesome/scss/font-awesome.scss';
import 'fm3/styles/bootstrap-override.scss';

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.self === window.top ? 'full' : 'embedded');

const store = createStore();

setStore(store);

const { location } = history;

loadAppState(store);

history.listen(handleLocationChange.bind(undefined, store));
handleLocationChange(store, location);

initAuthHelper(store);

store.dispatch(enableUpdatingUrl());

checkStravaAuth();

render(
  <Provider store={store}>
    <ErrorCatcher>
      <Main />
    </ErrorCatcher>
  </Provider>,
  document.getElementById('app'),
);

// prevent for development to make hot reloading working
if (process.env.NODE_ENV) {
  OfflinePluginRuntime.install({
    onUpdateReady() {
      // Tells to new SW to take control immediately
      OfflinePluginRuntime.applyUpdate();
    },
    onUpdated() {
      store.dispatch(
        toastsAdd({
          collapseKey: 'app.update',
          messageKey: 'general.appUpdated',
          style: 'info',
          actions: [
            { nameKey: 'general.yes', action: reloadApp() },
            { nameKey: 'general.no' },
          ],
        }),
      );
    },
    // TODO
    // onUpdateFailed() {
    // },
  });
}

function loadAppState() {
  let appState;
  try {
    appState = JSON.parse(storage.getItem('appState'));
  } catch (e) {
    // ignore
  }

  if (appState) {
    if (appState.main) {
      store.dispatch(mainLoadState(appState.main));
    }
    if (appState.map) {
      store.dispatch(mapLoadState(appState.map));
    }
    if (appState.trackViewer) {
      store.dispatch(trackViewerLoadState(appState.trackViewer));
    }
  }

  store.dispatch(
    l10nSetChosenLanguage(
      appState && [null, 'en', 'sk', 'cs'].includes(appState.language)
        ? appState.language
        : null,
    ),
  );
}

function checkStravaAuth() {
  const img = new Image();
  img.onload = () => {
    store.dispatch(mapSetStravaAuth(true));
  };
  img.src =
    'https://heatmap-external-a.strava.com/tiles-auth/both/bluered/16/36718/22612.png';
}
