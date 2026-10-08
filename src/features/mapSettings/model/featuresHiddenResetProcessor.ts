import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapSetFeaturesHidden } from '@features/map/model/actions.js';
import { anyFeatureDrawn } from '../mapFeatureCounts.js';

// Hidden with nothing to hide — none left, or none to begin with — they show:
// a warning about hidden features would be about nothing.
export const featuresHiddenResetProcessor: Processor = {
  statePredicate: (state) =>
    state.map.featuresHidden && !anyFeatureDrawn(state),
  handle: ({ dispatch }) => {
    dispatch(mapSetFeaturesHidden(false));
  },
};
