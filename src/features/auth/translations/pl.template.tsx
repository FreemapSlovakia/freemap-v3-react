import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const pl: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Połącz',
  connectSuccess: 'Połączono',
  disconnectLabel: 'Odłącz',
  disconnectSuccess: 'Odłączono',
  logInWith: 'Wybierz dostawcę logowania',
  logInSuccess: 'Zalogowano pomyślnie.',
  logInError: ({ err }) => addError(getMessages()!, 'Błąd logowania', err),
  logInError2: 'Błąd logowania.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Błąd weryfikacji logowania', err),
  logOutSuccess: 'Wylogowano pomyślnie.',
  logOutError: ({ err }) => addError(getMessages()!, 'Błąd wylogowania', err),
};

export default pl;
