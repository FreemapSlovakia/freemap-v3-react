import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { AuthMessages } from './AuthMessages.js';

const en: AuthMessages = {
  connectLabel: 'Connect',
  connectSuccess: 'Connected',
  disconnectLabel: 'Disconnect',
  disconnectSuccess: 'Disconnected',
  logInWith: 'Choose a login provider',
  logInSuccess: 'You have been successfully logged in.',
  logInError: ({ err }) => addError(getMessages()!, 'Error logging in', err),
  logInError2: 'Error logging in.',
  verifyError: ({ err }) =>
    addError(getMessages()!, 'Error verifying authentication', err),
  logOutSuccess: 'You have been successfully logged out.',
  logOutError: ({ err }) => addError(getMessages()!, 'Error logging out', err),
};

export default en;
