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
    ascent: 'Climb',
    speed: 'Speed',
    avgSpeed: 'Average speed',
    accuracy: 'Accuracy',
    points: 'Points',
    segments: 'Segments',
    lastFix: 'Last fix',
  },
  deleteModal: {
    title: 'Delete the recording?',
    message:
      'The recorder discards its whole track. This cannot be undone. Finish the ' +
      'recording instead if you want to keep it.',
    confirm: 'Delete',
  },
  setup: {
    title: 'The recorder may not survive a long recording',
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
      `${vendor} devices need autostart or battery settings changed by hand, ` +
      `or the recorder is stopped in the background.`,
    open: 'Open the recorder',
  },
  errors: {
    unreachable:
      'The recorder did not answer. Make sure it is installed and running.',
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
    http: 'The recorder answered with an error.',
    protocol: 'The recorder answered with something unexpected.',
    unknown: 'Talking to the recorder failed.',
  },
  settingsModal: {
    title: 'Recording settings',
    recorderSection: 'What gets recorded',
    recorderIntro:
      'Applied by the recorder when a recording starts, so changing them does ' +
      'not affect a recording already running.',
    intervalMs: 'Time between fixes (s)',
    minDistanceM: 'Minimum distance between fixes (m)',
    maxAccuracyM: 'Discard fixes less accurate than (m)',
    maxAccuracyOff: 'Keep every fix',
    priority: 'Accuracy',
    priorityHigh: 'Highest (GPS, most battery)',
    priorityBalanced: 'Balanced',
    priorityLow: 'Low (least battery)',
    displaySection: 'Display',
    splitGapS: 'Start a new segment after a gap of (min)',
    splitGapOff: 'Never split',
    splitGapHint:
      'A break longer than this is drawn and exported as a gap instead of a ' +
      'straight line across it.',
    feedLocation: 'Show my position from the recording',
    feedLocationHint:
      'While recording, the position marker follows the recorded fixes instead ' +
      'of the browser watching the GPS a second time. Turn this off for a ' +
      'smoother marker when recording at long intervals — at the cost of the ' +
      'battery the interval was meant to save.',
    keepScreenAwake: 'Keep the screen on while recording',
  },
};

export default en;
