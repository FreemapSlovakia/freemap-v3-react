import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { areFeaturesHidden } from '@features/map/featuresOpacity.js';
import { mapSetFeaturesOpacity } from '@features/map/model/actions.js';
import { anyFeatureDrawn } from '../mapFeatureCounts.js';

// Hidden when the map gets its first feature or loses its last one, they show.
// Only on that change, so the slider still goes low on an empty map.
export const featuresHiddenResetProcessor: Processor = {
  stateChangePredicate: anyFeatureDrawn,
  statePredicate: (state) => areFeaturesHidden(state.map.featuresOpacity),
  handle: ({ dispatch }) => {
    dispatch(mapSetFeaturesOpacity(1));
  },
};
