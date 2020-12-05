import { setDefaultGetErrorObject } from 'typescript-is';
import { setStore as setErrorHandlerStore } from 'fm3/globalErrorHandler';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { Main } from 'fm3/components/Main';
import { ErrorCatcher } from 'fm3/components/ErrorCatcher';

import {
  enableUpdatingUrl,
  setAppState,
  setEmbedFeatures,
} from 'fm3/actions/mainActions';
// import { errorSetError } from 'fm3/actions/errorActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';

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
import { MessagesProvider } from './components/TranslationProvider';

setDefaultGetErrorObject(() => null);

// filter out old browsers
[].flatMap(() => null);

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.self === window.top ? 'full' : 'embedded');

const store = createReduxStore();

setErrorHandlerStore(store);

loadAppState();

store.dispatch(authInit());

const { location } = history;

history.listen((update) => {
  handleLocationChange(store, update.location);
});

handleLocationChange(store, location);

attachOsmLoginMessageHandler(store);

store.dispatch(enableUpdatingUrl());

render(
  <Provider store={store}>
    <MessagesProvider>
      <ErrorCatcher>
        <Main />
      </ErrorCatcher>
    </MessagesProvider>
  </Provider>,
  document.getElementById('app'),
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
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
