import { authSetUser } from 'fm3/actions/authActions';
import { removeAds, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { RootState } from 'fm3/store';
import { LoginResponse } from 'fm3/types/common';
import { Dispatch } from 'redux';
import { assert } from 'typia';

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const { user, connect, clientData } = assert<LoginResponse>(await res.json());

  dispatch(
    toastsAdd({
      id: 'lcd',
      messageKey: connect ? 'auth.connect.success' : 'auth.logIn.success',
      style: 'info',
      timeout: 5000,
    }),
  );

  dispatch(authSetUser(user));

  if (!user.isPremium && getState().main.removeAdsOnLogin) {
    dispatch(removeAds());
  }

  if (clientData?.successAction) {
    dispatch(clientData.successAction);
  } else if (connect) {
    dispatch(setActiveModal('account'));
  }
}
