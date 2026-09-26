import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { mapRefocus } from '../actions.js';
import { withoutMarkers } from '../mapCombination.js';

let prevLayers: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, init],
  handle: async ({ getState }) => {
    // A combination's marker is a random id, not a layer worth counting.
    const layers = withoutMarkers(getState().map.layers);

    const joinedLayers = [...layers].sort().join(',');

    if ([...prevLayers].sort().join(',') !== joinedLayers) {
      trackMatomo(['trackEvent', 'Map', 'setLayers', joinedLayers]);

      prevLayers = layers;
    }
  },
};
