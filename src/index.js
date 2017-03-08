import React from 'react';
import { render } from 'react-dom';
import { hashHistory, Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import createLogger from 'redux-logger';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import Main from 'fm3/components/Main';

import 'fm3/styles/page.scss';

const middleware = applyMiddleware(
  createLogger(),
  createLogicMiddleware(logics)
);

const store = createStore(reducer, middleware);

render((
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/:mapType/:zoom/:lat/:lon" component={Main}/>
      <Route path="/*" component={Main}></Route>
    </Router>
  </Provider>
), document.getElementById('app'));
