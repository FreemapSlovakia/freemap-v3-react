import { purchase, setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import { loadPremiumMessages } from '@features/premium/translations/loadPremiumMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Action, Dispatch } from 'redux';
import z from 'zod';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { authSetUser } from '../actions.js';
import { parseUser } from '../parseUser.js';
import {
  AUTH_PROVIDER_LABELS,
  type AuthProvider,
  LoginResponseSchema,
} from '../types.js';

const RawLoginResponseSchema = z.object({
  ...LoginResponseSchema.omit({ user: true }).shape,
  user: z.unknown(),
});

export async function handleLoginResponse(
  res: Response,
  getState: () => RootState,
  dispatch: Dispatch,
  /** `null` for email login, which is never a connect. */
  provider: AuthProvider | null,
  successAction?: Action,
) {
  const response = RawLoginResponseSchema.parse(await res.json());

  const { connect, clientData } = response;

  const user = parseUser(response.user);

  trackMatomo(['trackEvent', 'Auth', 'login', connect ? 'connect' : 'login']);

  // Re-authorizing a provider the account already has (e.g. for a wider scope)
  // connects nothing. Read before `authSetUser` below.
  const reauthorized =
    connect &&
    provider &&
    getState().auth.user?.authProviders.includes(provider);

  if (!reauthorized) {
    dispatch(
      toastsAdd({
        id: 'lcd',
        messageKey: connect ? 'connectSuccess' : 'logInSuccess',
        messageParams: { provider: provider && AUTH_PROVIDER_LABELS[provider] },
        messageLoader: loadAuthMessages,
        style: 'info',
        timeout: 5000,
      }),
    );
  }

  dispatch(authSetUser(user));

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

  const followUp = successAction ?? clientData?.successAction;

  if (followUp) {
    dispatch(followUp);
  } else if (connect) {
    // Back where the connect started, showing the provider added.
    dispatch(setActiveModal({ type: 'account', section: 'providers' }));
  }
}
