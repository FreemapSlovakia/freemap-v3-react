import { FaKey } from 'react-icons/fa';
import { Messages } from './messagesInterface.js';

const messages: Messages = {
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
    delete: 'Delete access token?',
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
    watchPrivately: 'Watch privately',
    watch: 'Watch',
    delete: 'Delete device?',
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
        <p>
          Enter following URL to your tracker (eg.{' '}
          <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">
            Locus
          </a>{' '}
          or OsmAnd):{' '}
          <code>
            {process.env['API_URL']}/tracking/track/<i>token</i>
          </code>{' '}
          where <i>token</i> is listed in the table below.
        </p>
        <p>
          Endpoint supports HTTP <code>GET</code> or <code>POST</code> with
          URL-encoded parameters:
        </p>
        <ul>
          <li>
            <code>lat</code> - latitude in degrees (mandatory)
          </li>
          <li>
            <code>lon</code> - longitude in degrees (mandatory)
          </li>
          <li>
            <code>time</code>, <code>timestamp</code> - JavaScript parsable
            datetime or Unix time in s or ms
          </li>
          <li>
            <code>alt</code>, <code>altitude</code> - altitude in meters
          </li>
          <li>
            <code>speed</code> - speed in m/s
          </li>
          <li>
            <code>speedKmh</code> - speed in km/h
          </li>
          <li>
            <code>acc</code> - accuracy in meters
          </li>
          <li>
            <code>hdop</code> - horizontal DOP
          </li>
          <li>
            <code>bearing</code> - bearing in degrees
          </li>
          <li>
            <code>battery</code> - battery in percents
          </li>
          <li>
            <code>gsm_signal</code> - GSM signal in percents
          </li>
          <li>
            <code>message</code> - message (note)
          </li>
        </ul>
        <hr />
        <p>
          In the case of tracker TK102B, configure it's address to{' '}
          <code>
            {process.env['API_URL']
              ?.replace(/https?:\/\//, '')
              ?.replace(/:\d+$/, '')}
            :3030
          </code>
        </p>
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
};

export default messages;
