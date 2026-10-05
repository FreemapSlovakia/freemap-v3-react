import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { mapRefocus } from '../actions.js';
import { presetIdOf } from '../mapPreset.js';

let prevLayers: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, init],
  handle: async ({ getState }) => {
    // A preset's id is random per user, which would make every set unique.
    const layers = getState().map.layers.map((item) =>
      presetIdOf(item) === undefined ? item : '@',
    );

    const joinedLayers = [...layers].sort().join(',');

    if ([...prevLayers].sort().join(',') !== joinedLayers) {
      trackMatomo(['trackEvent', 'Map', 'setLayers', joinedLayers]);

      prevLayers = layers;
    }
  },
};
