import { purchase, setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { upgradeCustomLayerDefs } from '@shared/mapDefinitions.js';
import { isPremium } from '@shared/premium.js';
import { StringDates } from '@shared/types/common.js';
import { Dispatch } from 'redux';
import { assert, is } from 'typia';
import { authSetUser } from '../actions.js';
import { LoginResponse, User, UserSettings } from '../types.js';

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const {
    user: rawUser,
    connect,
    clientData,
  } = assert<
    Omit<LoginResponse, 'user'> & {
      user: StringDates<Omit<User, 'settings'>> & { settings?: unknown };
    }
  >(await res.json());

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

  let settings: UserSettings | undefined;

  if (is<{ customLayers: unknown[] }>(user.settings)) {
    user.settings.customLayers = upgradeCustomLayerDefs(
      user.settings.customLayers,
    );
  }

  try {
    settings = assert<UserSettings>(user.settings);
  } catch (e) {
    console.error('Invalid user settings:', e);

    settings = undefined;
  }

  dispatch(authSetUser({ ...user, settings }));

  const { purchaseOnLogin } = getState().auth;

  if (purchaseOnLogin) {
    if (isPremium(user) && purchaseOnLogin.type === 'premium') {
      dispatch(
        toastsAdd({
          id: 'premiumAlready',
          messageKey: 'premium.alreadyPremium',
          style: 'info',
          timeout: 5000,
        }),
      );
    } else {
      dispatch(purchase(purchaseOnLogin));
    }
  }

  if (clientData?.successAction) {
    dispatch(clientData.successAction);
  } else if (connect) {
    dispatch(setActiveModal('account'));
  }
}
