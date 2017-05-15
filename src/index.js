import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';
import { mainLoadState } from 'fm3/actions/mainActions';
import { mapLoadState } from 'fm3/actions/mapActions';

import Main from 'fm3/components/Main';
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

render((
  <Provider store={store}>
    <div>
      <Router>
        <Route path="/" component={Main} />
      </Router>
    </div>
  </Provider>
), document.getElementById('app'));
