import type { ReactNode } from 'react';

export type GpsRecorderMessages = {
  /** Transport controls. */
  record: string;
  /** The recorder's own stop: the track stays, and recording can continue. */
  pause: string;
  /** Ends the ride — the track moves out of the recorder and into the app. */
  stop: string;
  /** Reconnect call-to-action, offered only once a connection has failed. */
  connect: string;
  install: string;
  update: string;
  delete: string;
  settings: string;
  /** Opens the readout dropdown; the summary in it is the visible label. */
  details: string;
  state: {
    recording: string;
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
    lastFix: string;
  };
  deleteModal: {
    title: string;
    message: string;
    confirm: string;
  };
  /** Warnings from `/status` that decide whether a long recording survives. */
  setup: {
    /** The whole warning as one toast message, the outstanding items as a list. */
    summary: (props: { items: string[] }) => ReactNode;
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
    needsForeground: string;
    notPersisted: string;
    notStored: string;
    incomplete: string;
    outdated: string;
    http: string;
    protocol: string;
    unknown: string;
  };
  settingsModal: {
    title: string;
    recorderSection: string;
    recorderIntro: string;
    intervalMs: string;
    minDistanceM: string;
    maxAccuracyM: string;
    maxAccuracyOff: string;
    source: string;
    sourceGps: string;
    sourceFused: string;
    sourceHint: string;
    priority: string;
    priorityHigh: string;
    priorityBalanced: string;
    priorityLow: string;
    /** Shown in place of a choice the recorder would ignore. */
    priorityFusedOnly: string;
    displaySection: string;
    splitGapS: string;
    splitGapOff: string;
    splitGapHint: string;
    feedLocation: string;
    feedLocationHint: string;
    keepScreenAwake: string;
  };
};
