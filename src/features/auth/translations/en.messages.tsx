import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { AuthMessages } from './AuthMessages.js';

const en: AuthMessages = {
  account: {
    name: 'Name',
    email: 'Email',
    description: 'About me',
    delete: 'Delete account',
    deleteWarning:
      'Are you sure to delete your account? It will remove all your photos, photo comments and ratings, your maps, and tracked devices.',
    personalInfo: 'Personal information',
    authProviders: 'Login providers',
    picture: 'Profile picture',
    choosePicture: 'Choose picture',
    pictureTooLarge: 'Picture is too large. Maximum size is 5 MB.',
  },
  connectLabel: 'Connect',
  connectSuccess: ({ provider }) =>
    `Your ${provider} account has been connected to your Freemap account. You can now also log in with it.`,
  differentAccount: ({ provider }) =>
    `You authorized a different ${provider} account than the one connected to your Freemap account. Log out of ${provider}, log in with the connected account and try again.`,
  disconnectLabel: 'Disconnect',
  disconnectSuccess: 'Disconnected',
  lastProvider:
    'This is the last way to log in to your account, so it cannot be disconnected. Reload the page to see the current state.',
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
