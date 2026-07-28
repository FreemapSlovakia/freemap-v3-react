import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
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

export const gpsRecorderStopProcessor: Processor = {
  actionCreator: gpsRecorderStop,
  id: 'gpsRecorder.stop',
  handle: async (...params) => (await handlers()).stopHandler(...params),
};

export const gpsRecorderSyncProcessor: Processor = {
  actionCreator: gpsRecorderSync,
  id: 'gpsRecorder.sync',
  handle: async (...params) => (await handlers()).syncHandler(...params),
};
