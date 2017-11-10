import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';
import 'fullscreen-api-polyfill';

import Main from 'fm3/components/Main';
import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import { mainLoadState, setActiveModal } from 'fm3/actions/mainActions';
import { mapLoadState } from 'fm3/actions/mapActions';
import { trackViewerLoadState } from 'fm3/actions/trackViewerActions';
import { tipsNext, tipsPreventNextTime } from 'fm3/actions/tipsActions';

import history from 'fm3/history';
import handleLocationChange from 'fm3/locationChangeHandler';
import initAuthHelper from 'fm3/authHelper';
import 'fm3/fbLoader';

import 'fm3/styles/global.scss';

const logicMiddleware = createLogicMiddleware(logics);
const middlewares = [logicMiddleware];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(createLogger());
}

const store = createStore(reducer, applyMiddleware(...middlewares));

logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

loadAppState(store);

initAuthHelper(store);

history.listen(handleLocationChange.bind(undefined, store));

handleLocationChange(store, history.location);

const embedded = window.self !== window.top;

// show tips only if not embedded and there are no other query parameters except 'map' or 'layers'
if (!embedded && history.location.search.substring(1).split('&').every(x => /^(map|layers)=|^$/.test(x))) {
  const preventTips = localStorage.getItem('preventTips') === 'true';
  store.dispatch(tipsPreventNextTime(preventTips));
  if (!preventTips) {
    store.dispatch(tipsNext(localStorage.getItem('tip') || null));
    store.dispatch(setActiveModal('tips'));
  }
}

if (embedded) {
  document.body.classList.add('embedded');
}

render(
  <Provider store={store}>
    <Main />
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
}
