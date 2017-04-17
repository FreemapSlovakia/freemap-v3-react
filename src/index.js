import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import Main from 'fm3/components/Main';

import 'fm3/styles/global.scss';

const middleware = applyMiddleware(
  createLogger(),
  createLogicMiddleware(logics),
);

let store;
try {
  const appState = JSON.parse(localStorage.getItem('appState'));
  sanitizeSavedAppState(appState);
  store = createStore(reducer, appState, middleware);
} catch (e) {
  store = createStore(reducer, middleware);
}

// FIXME handle invalid values saved state in some generic way
function sanitizeSavedAppState(appState) {
  /* eslint-disable no-param-reassign */

  if (appState.main) {
    appState.main.tool = null;
  }

  if (appState.main.expertMode === undefined) {
    appState.main.expertMode = false;
  }

  if (!appState.map.overlayOpacity) {
    appState.map.overlayOpacity = { N: 1.0 };
  }

  if (!appState.map.overlayOpacity.t) {
    appState.map.overlayOpacity.t = 1.0;
  }

  if (!appState.map.overlayOpacity.c) {
    appState.map.overlayOpacity.c = 1.0;
  }
}

render((
  <Provider store={store}>
    <div>
      <Router>
        <Route path="/" component={Main} />
      </Router>
    </div>
  </Provider>
), document.getElementById('app'));
