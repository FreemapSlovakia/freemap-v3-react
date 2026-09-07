import { isToolOpen } from '@app/store/selectors.js';
import { makeFixProcessor } from '@features/location/model/makeFixProcessor.js';
import { placeToposcopeCenter } from '../centerPoint.js';

/** Stands the dial where the fix landed, as a drawn point. */
export const toposcopeFixProcessor = makeFixProcessor(
  'toposcope-center',
  (state) => isToolOpen(state, 'toposcope'),
  placeToposcopeCenter,
);
