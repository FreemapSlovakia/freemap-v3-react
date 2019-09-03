import { setDefaultGetErrorMessage } from 'typescript-is';
import { setStore as setErrorHandlerStore } from 'fm3/globalErrorHandler';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';

import { Main } from 'fm3/components/Main';
import { ErrorCatcher } from 'fm3/components/ErrorCatcher';

import {
  enableUpdatingUrl,
  reloadApp,
  setAppState,
} from 'fm3/actions/mainActions';
// import { errorSetError } from 'fm3/actions/errorActions';
import { mapSetStravaAuth } from 'fm3/actions/mapActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { history } from 'fm3/historyHolder';
import { handleLocationChange } from 'fm3/locationChangeHandler';
import { attachOsmLoginMessageHandler } from 'fm3/osmLoginMessageHandler';
import 'fm3/googleAnalytics';
import 'fm3/fbLoader';
import { createReduxStore } from 'fm3/storeCreator';
import { storage } from 'fm3/storage';

import 'font-awesome/scss/font-awesome.scss';
import 'fm3/styles/bootstrap-override.scss';
import { authInit } from './actions/authActions';
import { assertType } from 'typescript-is';
import { AppState } from './types/common';

setDefaultGetErrorMessage(() => null);

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.self === window.top ? 'full' : 'embedded');

const store = createReduxStore();

setErrorHandlerStore(store);

loadAppState();

const { location } = history;
history.listen(location => {
  handleLocationChange(store, location);
});
handleLocationChange(store, location);

store.dispatch(authInit());
attachOsmLoginMessageHandler(store);

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
  let appState: AppState | undefined;
  const as = storage.getItem('appState');
  if (as) {
    try {
      appState = assertType<AppState>(JSON.parse(as));
    } catch (e) {
      storage.removeItem('appState');
      throw e;
    }
  }

  if (appState) {
    store.dispatch(setAppState(appState));
  }

  store.dispatch(l10nSetChosenLanguage(appState ? appState.language : null));
}

function checkStravaAuth() {
  const img = new Image();
  img.onload = () => {
    store.dispatch(mapSetStravaAuth(true));
  };
  img.src =
    'https://heatmap-external-a.strava.com/tiles-auth/both/bluered/16/36718/22612.png';
}
