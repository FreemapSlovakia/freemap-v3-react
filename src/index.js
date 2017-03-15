import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
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
    <div>
      <Router>
        <Switch>
          <Route path="/:mapType/:zoom/:lat/:lon" component={Main}/>
          <Route path="/" component={Main}></Route>
        </Switch>
      </Router>
    </div>
  </Provider>
), document.getElementById('app'));
