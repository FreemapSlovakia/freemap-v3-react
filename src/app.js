import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory, Router, Route } from 'react-router';

import Main from './components/main';

import './styles/page.scss';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/:mapType/:zoom/:lat/:lon" component={Main}/>
    <Route path="/" component={Main}></Route>
  </Router>
), document.getElementById('app'));
