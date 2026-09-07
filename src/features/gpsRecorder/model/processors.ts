import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isToolOpen } from '@app/store/selectors.js';
import { reconcileRecorderConnection } from '../connection.js';
import {
  gpsRecorderClear,
  gpsRecorderPause,
  gpsRecorderPushedStatus,
  gpsRecorderStart,
  gpsRecorderStop,
  gpsRecorderSync,
} from './actions.js';

const handlers = () =>
  import(
    /* webpackChunkName: "gps-recorder-processor-handlers" */
    './recorderHandlers.js'
  );

export const gpsRecorderStartProcessor: Processor = {
  actionCreator: gpsRecorderStart,
  id: 'gpsRecorder.start',
  // Every recorder failure is reported by the tool's own toasts, which say what
  // can be done about each cause — so nothing here reaches the generic
  // processor-error toast.
  handle: async (...params) => (await handlers()).startHandler(...params),
};

export const gpsRecorderPauseProcessor: Processor = {
  actionCreator: gpsRecorderPause,
  id: 'gpsRecorder.pause',
  handle: async (...params) => (await handlers()).pauseHandler(...params),
};

export const gpsRecorderStopProcessor: Processor<typeof gpsRecorderStop> = {
  actionCreator: gpsRecorderStop,
  id: 'gpsRecorder.stop',
  handle: async (...params) => (await handlers()).stopHandler(...params),
};

export const gpsRecorderSyncProcessor: Processor<typeof gpsRecorderSync> = {
  actionCreator: gpsRecorderSync,
  id: 'gpsRecorder.sync',
  handle: async (...params) => (await handlers()).syncHandler(...params),
};

export const gpsRecorderPushedStatusProcessor: Processor<
  typeof gpsRecorderPushedStatus
> = {
  actionCreator: gpsRecorderPushedStatus,
  id: 'gpsRecorder.pushedStatus',
  handle: async (...params) =>
    (await handlers()).pushedStatusHandler(...params),
};

export const gpsRecorderClearProcessor: Processor = {
  actionCreator: gpsRecorderClear,
  id: 'gpsRecorder.clear',
  handle: async (...params) => (await handlers()).clearHandler(...params),
};

/**
 * Whether the tool is open decides whether there should be a connection, so
 * the connection has to hear about it — from the store rather than from the
 * menu's lifecycle, which is not the same thing: the menu is unmounted while
 * the map is being used to pick a place, and a tool closed from the URL hash
 * in that state would otherwise reach nobody and leave the stream running.
 */
export const gpsRecorderToolProcessor: Processor = {
  stateChangePredicate: (state) => isToolOpen(state, 'gps-recorder'),
  id: 'gpsRecorder.tool',
  handle: async () => {
    reconcileRecorderConnection();
  },
};
