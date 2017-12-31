import 'babel-polyfill';
import 'fullscreen-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';

import Main from 'fm3/components/Main';
import ErrorCatcher from 'fm3/components/ErrorCatcher';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import { mainLoadState, enableUpdatingUrl, reducingError } from 'fm3/actions/mainActions';
import { mapLoadState } from 'fm3/actions/mapActions';
import { trackViewerLoadState } from 'fm3/actions/trackViewerActions';
import { l10nSetLanguage } from 'fm3/actions/l10nActions';

import history from 'fm3/history';
import handleLocationChange from 'fm3/locationChangeHandler';
import initAuthHelper from 'fm3/authHelper';
import 'fm3/googleAnalytics';
import 'fm3/fbLoader';

import 'fm3/styles/bootstrap-override.scss';

if (window.location.search === '?reset-local-storage') {
  localStorage.clear();
}

if (window.self !== window.top) {
  document.body.classList.add('embedded');
}

const logicMiddleware = createLogicMiddleware(logics);
const middlewares = [logicMiddleware];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(createLogger());
}

const errorHandlingMiddleware = () => next => (action) => {
  try {
    return next(action);
  } catch (error) {
    // eslint-disable-next-line
    console.error('Reducing error:', error);
    return next(reducingError(action, error));
  }
};

middlewares.push(errorHandlingMiddleware);

const store = createStore(reducer, applyMiddleware(...middlewares));

logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

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

  const languages = ['en', 'sk'];

  let language;
  if (appState && languages.includes(appState.language)) {
    ({ language } = appState);
  } else {
    language = navigator.languages.map(lang => lang.split('-')[0]).find(lang => languages.includes(lang)) || 'en';
  }
  store.dispatch(l10nSetLanguage(language));
}
