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
