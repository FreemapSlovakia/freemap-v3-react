import { Middleware, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { isActionOf } from 'typesafe-actions';
import { authSetUser } from 'fm3/actions/authActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { storage } from 'fm3/storage';
import { RootAction } from 'fm3/actions';

// TODO to processors

export const utilityMiddleware: Middleware<any, RootState, Dispatch> = ({
  getState,
}) => (next: Dispatch) => (action: RootAction): any => {
  const result = next(action);

  if (isActionOf(authSetUser, action)) {
    const {
      auth: { user },
    } = getState();

    if (user) {
      window.ga('send', 'event', 'Auth', 'setUser', user.id);
    }
  } else if (isActionOf(selectFeature, action)) {
    const { selection } = getState().main;

    if (selection) {
      window.ga('send', 'event', 'Tool', 'setTool', selection.type);
    }
  } else if (isActionOf(tipsShow, action)) {
    const { tip } = getState().tips;

    if (tip) {
      storage.setItem('tip', tip);
    } else {
      storage.removeItem('tip');
    }
  }

  return result;
};
