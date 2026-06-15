import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import { FaKey } from 'react-icons/fa';
import { TrackingMessages } from './TrackingMessages.js';

const en: TrackingMessages = {
  subscribeNotFound: ({ id }) => (
    <>
      Watch token <i>{id}</i> doesn't exist.
    </>
  ),
  subscribeError: ({ id }) => (
    <>
      Error watching using token <i>{id}</i>.
    </>
  ),
  trackedDevices: {
    button: 'Watched',
    modalTitle: 'Watched Devices',
    desc: 'Manage watched devices to see the position of your friends.',
    modifyTitle: (name) => (
      <>
        Modify Watched Device <i>{name}</i>
      </>
    ),
    createTitle: (name) => (
      <>
        Watch Device <i>{name}</i>
      </>
    ),
    storageWarning:
      'Please note that the list of devices is only reflected in the page URL. If you want to save it, use the "My Maps" function.',
  },
  accessToken: {
    token: 'Watch Token',
    timeFrom: 'From',
    timeTo: 'To',
    listingLabel: 'Listing Label',
    note: 'Note',
    delete: (token) => (
      <>
        Do you really want to delete access token <i>{token}</i>?
      </>
    ),
    deleteTitle: 'Access token deletion',
  },
  accessTokens: {
    modalTitle: (deviceName) => (
      <>
        Watch Tokens for <i>{deviceName}</i>
      </>
    ),
    desc: (deviceName) => (
      <>
        Define watch tokens to share position of your device <i>{deviceName}</i>{' '}
        with your friends.
      </>
    ),
    createTitle: (deviceName) => (
      <>
        Add Watch Token for <i>{deviceName}</i>
      </>
    ),
    modifyTitle: ({ token, deviceName }) => (
      <>
        Modify Watch Token <i>{token}</i> for <i>{deviceName}</i>
      </>
    ),
  },
  trackedDevice: {
    token: 'Watch Token',
    label: 'Label',
    fromTime: 'Since',
    maxAge: 'Max Age',
    maxCount: 'Max Count',
    splitDistance: 'Split Distance',
    splitDuration: 'Split Duration',
    color: 'Color',
    width: 'Width',
  },
  devices: {
    button: 'My Devices',
    modalTitle: 'My tracked devices',
    createTitle: 'Create Tracking Device',
    watchTokens: 'Watch tokens',
    traccarQrCode: 'Traccar QR Code',
    watchPrivately: 'Watch privately',
    watch: 'Watch',
    delete: (name) => (
      <>
        Do you really want to delete device <i>{name}</i>?
      </>
    ),
    deleteTitle: 'Device deletion',
    modifyTitle: ({ name }) => (
      <>
        Modify Tracking Device <i>{name}</i>
      </>
    ),
    desc: () => (
      <>
        <p>
          Manage your devices so that others can watch your position if you give
          them watch token (you can create it through <FaKey /> icon).
        </p>

        <hr />

        <DocumentLink doc="tracking">
          How to set up your tracked device
        </DocumentLink>
      </>
    ),
  },
  device: {
    token: 'Track Token',
    name: 'Name',
    maxAge: 'Max Age',
    maxCount: 'Max Count',
    generatedToken: 'will be generated on save',
  },
  visual: {
    line: 'Line',
    points: 'Points',
    'line+points': 'Line + Points',
  },
};

export default en;
