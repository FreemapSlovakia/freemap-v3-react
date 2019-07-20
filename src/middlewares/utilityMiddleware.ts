import { Middleware, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { isActionOf } from 'typesafe-actions';
import { authSetUser } from 'fm3/actions/authActions';
import { setTool, reloadApp } from 'fm3/actions/mainActions';
import { tipsPrevious, tipsNext } from 'fm3/actions/tipsActions';
import storage from 'fm3/storage';

export const utilityMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ getState }) => next => (action: RootAction) => {
  const result = next(action);

  if (isActionOf(authSetUser, action)) {
    const {
      auth: { user },
    } = getState();
    if (user) {
      window.ga('send', 'event', 'Auth', 'setUser', user.id);
    }
  } else if (isActionOf(setTool, action)) {
    const {
      main: { tool },
    } = getState();
    if (tool) {
      window.ga('send', 'event', 'Tool', 'setTool', tool);
    }
  } else if (isActionOf(tipsNext, action) || isActionOf(tipsPrevious, action)) {
    const { tip } = getState().tips;
    if (tip) {
      storage.setItem('tip', tip);
    } else {
      storage.removeItem('tip');
    }
  } else if (isActionOf(reloadApp, action)) {
    window.location.reload();
  }

  return result;
};
