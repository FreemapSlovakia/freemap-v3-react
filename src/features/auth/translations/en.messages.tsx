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
  appTokens: {
    title: 'App tokens',
    about: 'What are app tokens?',
    intro:
      'An app token lets another application or a script use Freemap as you, for example to show premium photos. It can do only what its permissions allow, and nothing with your account itself.',
    usage: (
      <>
        Send the token in the HTTP <code>Authorization</code> header of each
        request to the Freemap API:
      </>
    ),
    tiles: (
      <>
        An app such as JOSM or Locus takes the outdoor map with the token in the
        tile URL:
      </>
    ),
    keepSecret:
      'Keep the token secret, like a password. If someone else may have got hold of it, delete it and create a new one.',
    none: 'You have no app tokens.',
    create: 'New token',
    note: 'Note',
    scopes: 'Permissions',
    scopeNames: {
      'gallery:read': 'View photos, including premium ones if you have premium',
      'gallery:write': 'Upload, edit, rate and comment on photos',
      'maps:read': 'View my maps',
      'maps:write': 'Create, change and delete my maps',
      'tracking:read': 'View my tracked devices',
      'tracking:write': 'Manage my tracked devices and their sharing',
      'tiles:outdoor':
        'Premium zooms (19+) of the outdoor map in apps such as JOSM or Locus, if you have premium',
      'tiles:shading':
        'Premium zooms (16+) of the terrain shadings in apps such as JOSM or Locus, if you have premium',
      'tiles:aerial':
        'Premium zooms (20) of the Slovak and Czech aerial imagery in apps such as JOSM or Locus, if you have premium',
    },
    expiration: 'Expires',
    never: 'Never',
    days: ({ count }) => `In ${count} days`,
    customDate: 'On a date',
    pastDate: 'The expiry date must be in the future.',
    lastUsed: 'Last used',
    neverUsed: 'Not used yet',
    created: 'Save the token now. Later it will not be available here to read.',
    revoke: 'Delete',
    revokeConfirm: ({ name }) =>
      `Delete the token “${name}”? Applications using it will stop working.`,
    noNote: 'Untitled',
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
