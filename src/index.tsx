import { setDefaultGetErrorObject } from 'typescript-is';
import { setStore as setErrorHandlerStore } from 'fm3/globalErrorHandler';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import { Main } from 'fm3/components/Main';
import { ErrorCatcher } from 'fm3/components/ErrorCatcher';

import {
  enableUpdatingUrl,
  reloadApp,
  setAppState,
  setEmbedFeatures,
} from 'fm3/actions/mainActions';
// import { errorSetError } from 'fm3/actions/errorActions';
import { mapSetStravaAuth } from 'fm3/actions/mapActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { history } from 'fm3/historyHolder';
import { handleLocationChange } from 'fm3/locationChangeHandler';
import { attachOsmLoginMessageHandler } from 'fm3/osmLoginMessageHandler';
import { attachKeyboardHandler } from 'fm3/keyboardHandler';
import 'fm3/googleAnalytics';
import 'fm3/fbLoader';
import { createReduxStore } from 'fm3/storeCreator';
import { storage } from 'fm3/storage';

import 'font-awesome/scss/font-awesome.scss';
import 'fm3/styles/bootstrap-override.scss';
import { authInit, authCheckLogin } from './actions/authActions';
import { assertType } from 'typescript-is';
import { AppState } from './types/common';

import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents';
import applyUpdate from 'serviceworker-webpack-plugin/lib/browser/applyUpdate';

setDefaultGetErrorObject(() => null);

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.self === window.top ? 'full' : 'embedded');

const store = createReduxStore();

setErrorHandlerStore(store);

loadAppState();

store.dispatch(authInit());

const { location } = history;
history.listen((location) => {
  handleLocationChange(store, location);
});
handleLocationChange(store, location);

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

if ('serviceWorker' in navigator) {
  const registration = runtime.register();

  registerEvents(registration, {
    onInstalled: () => {},
    onUpdateReady: () => {
      applyUpdate();
    },
    onUpdating: () => {},
    onUpdateFailed: () => {},
    onUpdated: () => {
      store.dispatch(
        toastsAdd({
          id: 'app.update',
          messageKey: 'general.appUpdated',
          style: 'info',
          actions: [
            { nameKey: 'general.yes', action: reloadApp() },
            { nameKey: 'general.no' },
          ],
        }),
      );
    },
  });
}

function loadAppState(): void {
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

  store.dispatch(
    l10nSetChosenLanguage(
      appState?.language?.replace(/-.*/, '') ?? null, // fixing wrong saved language because of bug in older version
    ),
  );
}

window.addEventListener('message', (e: MessageEvent) => {
  const { data } = e;
  if (data && typeof data === 'object' && typeof data.freemap === 'object') {
    if (data.freemap.action === 'setEmbedFeatures') {
      store.dispatch(setEmbedFeatures(data.freemap.payload));
    }
  }
});

store.dispatch(authCheckLogin());

attachKeyboardHandler(store);

function checkStravaAuth(): void {
  const img = new Image();
  img.onload = (): void => {
    store.dispatch(mapSetStravaAuth(true));
  };
  img.src =
    'https://heatmap-external-a.strava.com/tiles-auth/both/bluered/16/36718/22612.png';
}
