import { Dispatch } from 'redux';
import { assert } from 'typia';
import { authSetUser } from '../actions/authActions.js';
import { removeAds, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import type { RootState } from '../store.js';
import type { LoginResponse } from '../types/auth.js';
import { StringDates } from '../types/common.js';

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const { user, connect, clientData } = assert<StringDates<LoginResponse>>(
    await res.json(),
  );

  dispatch(
    toastsAdd({
      id: 'lcd',
      messageKey: connect ? 'auth.connect.success' : 'auth.logIn.success',
      style: 'info',
      timeout: 5000,
    }),
  );

  dispatch(
    authSetUser({
      ...user,
      premiumExpiration: user.premiumExpiration
        ? new Date(user.premiumExpiration)
        : null,
    }),
  );

  if (!user.premiumExpiration && getState().main.removeAdsOnLogin) {
    dispatch(removeAds());
  }

  if (clientData?.successAction) {
    dispatch(clientData.successAction);
  } else if (connect) {
    dispatch(setActiveModal('account'));
  }
}
