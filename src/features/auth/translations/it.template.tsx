import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const it: DeepPartialWithRequiredObjects<AuthMessages> = {
  connectLabel: 'Connetti',
  connectSuccess: 'Connesso',
  disconnectLabel: 'Disconnetti',
  disconnectSuccess: 'Disconnesso',
  logInWith: 'Scegli un provider di accesso',
  logInSuccess: 'Accesso eseguito correttamente.',
  logInError: ({ err }) => addError(getMessages()!, 'Error logging in:', err),
  logInError2: 'Error logging in.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Error verifying authentication:', err),
  logOutSuccess: 'Disconnessione avvenuta correttamente.',
  logOutError: ({ err }) => addError(getMessages()!, 'Error logging out:', err),
};

export default it;
