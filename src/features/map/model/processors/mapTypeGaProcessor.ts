import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { init } from '@/app/store/actions.js';
import { mapRefocus } from '../actions.js';

let prevLayers: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, init],
  handle: async ({ getState }) => {
    const {
      map: { layers },
    } = getState();

    const joinedLayers = [...layers].sort().join(',');

    if ([...prevLayers].sort().join(',') !== joinedLayers) {
      window._paq.push(['trackEvent', 'Map', 'setLayers', joinedLayers]);

      prevLayers = layers;
    }
  },
};
