import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const sk: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Pripojiť',
  connectSuccess: 'Pripojené',
  disconnectLabel: 'Odpojiť',
  disconnectSuccess: 'Odpojené',
  logInWith: 'Vyberte poskytovateľa prihlásenia',
  logInSuccess: 'Boli ste úspešne prihlásený.',
  logInError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa prihlásiť', err),
  logInError2: 'Nepodarilo sa prihlásiť.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa overiť prihlásenie', err),
  logOutSuccess: 'Boli ste úspešne odhlásený.',
  logOutError: ({ err }) =>
    addError(getMessages()!, 'Nepodarilo sa odhlásiť', err),
};

export default sk;
