import { Dispatch } from 'redux';
import { assert } from 'typia';
import { authSetUser } from '../actions/authActions.js';
import { purchase, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { isPremium } from '../premium.js';
import type { RootState } from '../store.js';
import type { LoginResponse } from '../types/auth.js';
import { StringDates } from '../types/common.js';

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const {
    user: rawUser,
    connect,
    clientData,
  } = assert<StringDates<LoginResponse>>(await res.json());

  dispatch(
    toastsAdd({
      id: 'lcd',
      messageKey: connect ? 'auth.connect.success' : 'auth.logIn.success',
      style: 'info',
      timeout: 5000,
    }),
  );

  const user = {
    ...rawUser,
    premiumExpiration: rawUser.premiumExpiration
      ? new Date(rawUser.premiumExpiration)
      : null,
  };

  dispatch(authSetUser(user));

  const { purchaseOnLogin } = getState().main;

  if (!isPremium(user) && purchaseOnLogin) {
    dispatch(purchase(purchaseOnLogin));
  }

  if (clientData?.successAction) {
    dispatch(clientData.successAction);
  } else if (connect) {
    dispatch(setActiveModal('account'));
  }
}
