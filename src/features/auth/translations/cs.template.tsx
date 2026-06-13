import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const cs: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Pripojit',
  connectSuccess: 'Pripojené',
  disconnectLabel: 'Odpojit',
  disconnectSuccess: 'Odpojené',
  logInWith: 'Vyberte poskytovatele přihlášení',
  logInSuccess: 'Byli jste úspěšně přihlášen.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se přihlásit', err),
  logInError2: 'Nepodařilo se přihlásit.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se ověřit přihlášení', err),
  logOutSuccess: 'Byli jste úspěšně odhlášen.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Nepodařilo se odhlásit', err),
};

export default cs;
