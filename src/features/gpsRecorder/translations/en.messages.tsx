import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const en: GpsRecorderMessages = {
  record: 'Record',
  resume: 'Resume',
  pause: 'Pause',
  stop: 'Stop',
  connect: 'Connect',
  install: 'Install the recorder',
  update: 'Update the recorder',
  save: 'Save to tracks',
  delete: 'Delete recording',
  settings: 'Recording settings',
  state: {
    recording: 'Recording',
    paused: 'Paused',
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
  },
  deleteModal: {
    title: 'Delete the recording?',
    message:
      'The recorder discards its whole track. This cannot be undone. Save the ' +
      'recording to your tracks first if you want to keep it.',
    confirm: 'Delete',
  },
  setup: {
    title: 'The recorder may not survive a long recording',
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
    outdated: 'The recorder is too old for this version of the map.',
    unsupported: 'This recorder does not offer that function.',
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
    recorderUnsupported:
      'The installed recorder ignores these settings. Update it to use them.',
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
    showAccuracyCircle: 'Show the accuracy of the last fix',
    followPosition: 'Keep the map on the last fix',
    keepScreenAwake: 'Keep the screen on while recording',
  },
};

export default en;
