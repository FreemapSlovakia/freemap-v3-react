import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const hu: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Csatlakozás',
  connectSuccess: 'Csatlakoztatva',
  disconnectLabel: 'Kapcsolat bontása',
  disconnectSuccess: 'Lecsatlakoztatva',
  logInWith: 'Válasszon bejelentkezési szolgáltatót',
  logInSuccess: 'Sikeresen bejelentkezett.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a bejelentkezésnél', err),
  logInError2: 'Hiba történt a bejelentkezésnél.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a hitelesítés ellenőrzésénél', err),
  logOutSuccess: 'Sikeresen kijelentkezett.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a kijelentkezésnél', err),
};

export default hu;
