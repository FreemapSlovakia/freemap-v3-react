import { enableUpdatingUrl } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapRefocus } from '../actions.js';

let prevLayers: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, enableUpdatingUrl /* any initial action */],
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
