import { makeFixProcessor } from '@features/location/model/makeFixProcessor.js';
import { placeToposcopeCenter } from '../centerPoint.js';

/** Stands the dial where the fix landed, as a drawn point. */
export const toposcopeFixProcessor = makeFixProcessor(
  'toposcope-center',
  'toposcope',
  placeToposcopeCenter,
);
