import { isToolOpen } from '@app/store/selectors.js';
import { makeFixProcessor } from '@features/location/model/makeFixProcessor.js';
import { panoramaPick } from '../actions.js';

/** Stands the viewer where the fix landed, which also renders. */
export const panoramaFixProcessor = makeFixProcessor(
  'panorama',
  (state) => isToolOpen(state, 'panorama'),
  (_, at) => panoramaPick(at),
);
