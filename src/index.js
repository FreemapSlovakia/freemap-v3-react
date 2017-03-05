import React from 'react';
import { render } from 'react-dom';
import { hashHistory, Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducers';

import Main from 'fm3/components/Main';

import 'fm3/styles/page.scss';

const store = createStore(reducer);

render((
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/:mapType/:zoom/:lat/:lon" component={Main}/>
      <Route path="/" component={Main}></Route>
    </Router>
  </Provider>
), document.getElementById('app'));
