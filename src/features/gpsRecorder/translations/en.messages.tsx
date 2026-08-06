import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const en: GpsRecorderMessages = {
  record: 'Record',
  pause: 'Pause',
  stop: 'Finish',
  connect: 'Connect',
  install: 'Install the recorder',
  update: 'Update the recorder',
  delete: 'Delete recording',
  settings: 'Recording settings',
  details: 'Recording details',
  recordInBrowser: 'Record in this browser',
  browserBadge: 'In this browser',
  browserWarning:
    'Recording in this browser. It stops when the screen locks or you leave ' +
    'this page, so keep both open for the whole ride.',
  browserNoStorage:
    'Recording in this browser, but it will not store the ride — reloading or ' +
    'closing this page loses it. Finish the recording to keep it.',
  state: {
    recording: 'Recording',
    stopped: 'Stopped',
    unknown: 'Not connected',
  },
  connection: {
    connecting: 'Connecting to the recorder…',
    syncing: 'Fetching the track…',
    live: 'Live',
    reconnecting: 'Reconnecting…',
    offline: 'No live view',
  },
  stats: {
    distance: 'Distance',
    duration: 'Duration',
    elevation: 'Elevation',
    ascent: 'Climb',
    speed: 'Speed',
    avgSpeed: 'Average speed',
    accuracy: 'Accuracy',
    satellites: 'Satellites',
    points: 'Points',
    segments: 'Segments',
    lastFix: 'Last fix',
  },
  stopModal: {
    title: 'Finish the recording?',
    message: ({ tool }) => (
      <>
        Recording is still running. Finishing stops it and moves the track to{' '}
        <b>{tool}</b>. The recorder keeps nothing, so the next recording starts
        a new track.
      </>
    ),
    confirm: 'Finish',
  },
  deleteModal: {
    title: 'Delete the recording?',
    message:
      'The recorder discards its whole track. This cannot be undone. Finish the ' +
      'recording instead if you want to keep it.',
    confirm: 'Delete',
  },
  setup: {
    summary: ({ items }) => (
      <>
        The recorder may not survive a long recording:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Precise location is not allowed.',
    permissionBackground:
      'Location in the background is not allowed, so recording stops when the ' +
      'app is not in the foreground.',
    permissionNotifications:
      'Notifications are not allowed, so Android may stop the recording service.',
    battery:
      'The recorder is subject to battery optimization, so Android may stop it.',
    oem: ({ vendor }) =>
      `${vendor} devices restrict background apps beyond Android's own rules, ` +
      `and the recorder's step for that is not confirmed done.`,
    open: 'Open the recorder',
  },
  errors: {
    unreachable: 'The recorder did not answer — it may not be running.',
    lnaDenied:
      'The browser refused access to the local network, so the live view is ' +
      'unavailable. The recording itself is unaffected.',
    setupNeeded:
      'The recorder cannot record yet — open it and grant what it asks for.',
    recording: 'Stop the recording before deleting its track.',
    incomplete:
      'Part of the recording has not reached this page yet, so nothing was ' +
      'taken and nothing was deleted. Reconnect and finish again.',
    notStored:
      'The recording could not be stored in this browser, so it was left on the ' +
      'recorder. It is in your tracks — export or save it from there.',
    notPersisted:
      'This browser would not promise to keep its storage, so the recording was ' +
      'left on the recorder. It is in your tracks — export or save it, then ' +
      'delete the recording.',
    needsForeground:
      'Android would not let the recorder start from the background. Open it ' +
      'and start there, or allow it to run without battery restrictions so it ' +
      'can be started from here.',
    outdated: 'The recorder is too old for this version of the map.',
    locationDenied:
      'This site is not allowed to use your location. Allow it in the browser ' +
      'settings for this site, then start the recording again.',
    locationUnavailable: 'This browser cannot report your location.',
    http: 'The recorder answered with an error.',
    protocol: 'The recorder answered with something unexpected.',
    unknown: 'Talking to the recorder failed.',
  },
  settingsModal: {
    title: 'Recording settings',
    backend: 'Record with',
    backendApp: 'The recorder app',
    backendBrowser: 'This browser',
    backendHint:
      'The app records with the screen off and measures elevation for every ' +
      'fix. This browser needs the page open and the screen on, but needs no ' +
      'install.',
    backendLockedHint:
      'Cannot be changed while a recording is running. Pause or finish it first.',
    recorderSection: 'What gets recorded',
    recorderIntro:
      'Applied by the recorder when a recording starts, so changing them does ' +
      'not affect a recording already running.',
    browserIntro:
      'Applied when a recording starts, so changing them does not affect a ' +
      'recording already running. The browser decides how often it reports a ' +
      'position, so these are limits rather than instructions.',
    intervalMs: 'Time between fixes',
    minDistanceM: 'Minimum distance between fixes',
    maxAccuracyM: 'Discard fixes less accurate than',
    maxAccuracyOff: 'Keep every fix',
    source: 'Position source',
    sourceGps: 'GPS receiver',
    sourceFused: 'Fused (GPS, wifi and sensors)',
    sourceHint:
      'The receiver measures elevation for every fix; the fused source places ' +
      'you better among buildings and under trees, but repeats the same ' +
      'elevation for seconds at a time.',
    priority: 'Accuracy',
    priorityHigh: 'Highest (GPS, most battery)',
    priorityBalanced: 'Balanced',
    priorityLow: 'Low (least battery)',
    priorityFusedOnly: 'Applies to the fused source only.',
    displaySection: 'Display',
    splitGapS: 'Start a new segment after a gap of',
    splitGapOff: 'Never split',
    splitGapHint:
      'A break longer than this is drawn and exported as a gap instead of a ' +
      'straight line across it.',
    feedLocation: 'Use the recording for “Locate me”',
    feedLocationHint:
      'While recording, “Locate me” shows the recorded fixes instead of the ' +
      'browser tracking GPS separately.',
    keepScreenAwake: 'Keep the screen on while recording',
  },
};

export default en;
