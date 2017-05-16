import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';

import Main from 'fm3/components/Main';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';
import { mainLoadState } from 'fm3/actions/mainActions';
import { mapLoadState, mapRefocus } from 'fm3/actions/mapActions';
import history from 'fm3/history';
import { getMapStateFromUrl, getMapStateDiffFromUrl } from 'fm3/urlMapUtils';

import 'whatwg-fetch';

import 'fm3/styles/global.scss';

const middleware = applyMiddleware(
  createLogger(),
  createLogicMiddleware(logics),
);

const store = createStore(reducer, middleware);

let appState;
try {
  appState = JSON.parse(localStorage.getItem('appState'));
} catch (e) {
  // ignore
}

if (appState) {
  store.dispatch(mainLoadState(appState.main));
  store.dispatch(mapLoadState(appState.map));
}

history.listen((location) => {
  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
});

render((
  <Provider store={store}>
    <Main />
  </Provider>
), document.getElementById('app'));
