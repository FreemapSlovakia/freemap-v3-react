import { setStore } from 'fm3/globalErrorHandler';
import 'babel-polyfill';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';

import Main from 'fm3/components/Main';
import ErrorCatcher from 'fm3/components/ErrorCatcher';

import { mainLoadState, enableUpdatingUrl } from 'fm3/actions/mainActions';
// import { errorSetError } from 'fm3/actions/errorActions';
import { mapLoadState } from 'fm3/actions/mapActions';
import { trackViewerLoadState } from 'fm3/actions/trackViewerActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';

import history from 'fm3/history';
import handleLocationChange from 'fm3/locationChangeHandler';
import initAuthHelper from 'fm3/authHelper';
import 'fm3/googleAnalytics';
import 'fm3/fbLoader';
import createStore from 'fm3/storeCreator';

import 'font-awesome/scss/font-awesome.scss';
import 'fm3/styles/bootstrap-override.scss';

if (window.location.search === '?reset-local-storage') {
  localStorage.clear();
}

// prevent for development to make hot reloading working
if (process.env.NODE_ENV) {
  // TODO make it working reliably ... OfflinePluginRuntime.install();
}

if (window.self !== window.top) {
  document.body.classList.add('embedded');
}

const store = createStore();

setStore(store);

const { location } = history;

loadAppState(store);

history.listen(handleLocationChange.bind(undefined, store));
handleLocationChange(store, location);

initAuthHelper(store);

store.dispatch(enableUpdatingUrl());

render(
  <Provider store={store}>
    <ErrorCatcher>
      <Main />
    </ErrorCatcher>
  </Provider>
  ,
  document.getElementById('app'),
);

function loadAppState() {
  let appState;
  try {
    appState = JSON.parse(localStorage.getItem('appState'));
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

  store.dispatch(l10nSetChosenLanguage(appState && [null, 'en', 'sk', 'cs'].includes(appState.language) ? appState.language : null));
}
