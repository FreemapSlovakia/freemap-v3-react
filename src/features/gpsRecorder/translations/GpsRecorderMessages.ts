export type GpsRecorderMessages = {
  /** Transport controls. */
  record: string;
  resume: string;
  pause: string;
  stop: string;
  /** Reconnect call-to-action, offered only once a connection has failed. */
  connect: string;
  install: string;
  update: string;
  save: string;
  delete: string;
  settings: string;
  state: {
    recording: string;
    paused: string;
    stopped: string;
    unknown: string;
  };
  connection: {
    connecting: string;
    syncing: string;
    live: string;
    reconnecting: string;
    offline: string;
  };
  stats: {
    distance: string;
    duration: string;
    ascent: string;
    speed: string;
    avgSpeed: string;
    accuracy: string;
    points: string;
    segments: string;
  };
  deleteModal: {
    title: string;
    message: string;
    confirm: string;
  };
  /** Warnings from `/status` that decide whether a long recording survives. */
  setup: {
    title: string;
    permissionFine: string;
    permissionBackground: string;
    permissionNotifications: string;
    battery: string;
    oem: (props: { vendor: string }) => string;
    open: string;
  };
  errors: {
    unreachable: string;
    lnaDenied: string;
    setupNeeded: string;
    recording: string;
    outdated: string;
    unsupported: string;
    http: string;
    protocol: string;
    unknown: string;
  };
  settingsModal: {
    title: string;
    recorderSection: string;
    recorderIntro: string;
    /** Shown when the running recorder ignores the config it was sent. */
    recorderUnsupported: string;
    intervalMs: string;
    minDistanceM: string;
    maxAccuracyM: string;
    maxAccuracyOff: string;
    priority: string;
    priorityHigh: string;
    priorityBalanced: string;
    priorityLow: string;
    displaySection: string;
    splitGapS: string;
    splitGapOff: string;
    splitGapHint: string;
    showAccuracyCircle: string;
    followPosition: string;
    keepScreenAwake: string;
  };
};
