import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  gpsRecorderClear,
  gpsRecorderDisconnect,
  gpsRecorderPause,
  gpsRecorderPushedStatus,
  gpsRecorderSave,
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
  // Every recorder failure is surfaced in the tool's own panel, so nothing here
  // reaches the generic processor-error toast.
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

export const gpsRecorderSyncProcessor: Processor = {
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

export const gpsRecorderDisconnectProcessor: Processor = {
  actionCreator: gpsRecorderDisconnect,
  id: 'gpsRecorder.disconnect',
  handle: async (...params) => (await handlers()).disconnectHandler(...params),
};

export const gpsRecorderClearProcessor: Processor = {
  actionCreator: gpsRecorderClear,
  id: 'gpsRecorder.clear',
  handle: async (...params) => (await handlers()).clearHandler(...params),
};

export const gpsRecorderSaveProcessor: Processor<typeof gpsRecorderSave> = {
  actionCreator: gpsRecorderSave,
  id: 'gpsRecorder.save',
  handle: async (...params) => (await handlers()).saveHandler(...params),
};
