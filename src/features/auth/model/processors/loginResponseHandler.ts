import { purchase, setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import { loadPremiumMessages } from '@features/premium/translations/loadPremiumMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Dispatch } from 'redux';
import z from 'zod';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { authSetUser } from '../actions.js';
import {
  LoginResponseSchema,
  RawUserSchema,
  type UserSettings,
  UserSettingsCompatSchema,
} from '../types.js';

const RawLoginResponseSchema = z.object({
  ...LoginResponseSchema.omit({ user: true }).shape,
  user: RawUserSchema,
});

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const { user, connect, clientData } = RawLoginResponseSchema.parse(
    await res.json(),
  );

  trackMatomo(['trackEvent', 'Auth', 'login', connect ? 'connect' : 'login']);

  dispatch(
    toastsAdd({
      id: 'lcd',
      messageKey: connect ? 'connectSuccess' : 'logInSuccess',
      messageLoader: loadAuthMessages,
      style: 'info',
      timeout: 5000,
    }),
  );

  let settings: UserSettings | undefined;

  const settingsResult = UserSettingsCompatSchema.safeParse(user.settings);

  if (settingsResult.success) {
    settings = settingsResult.data;
  } else {
    console.error('Invalid user settings:', settingsResult.error);
  }

  dispatch(authSetUser({ ...user, settings }));

  const { purchaseOnLogin } = getState().auth;

  if (purchaseOnLogin) {
    if (isPremium(user) && purchaseOnLogin.type === 'premium') {
      dispatch(
        toastsAdd({
          id: 'premiumAlready',
          messageKey: 'alreadyPremium',
          messageLoader: loadPremiumMessages,
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
    dispatch(setActiveModal({ type: 'account' }));
  }
}
