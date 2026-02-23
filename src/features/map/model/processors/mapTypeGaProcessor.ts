import { enableUpdatingUrl } from '../../../../actions/mainActions.js';
import { mapRefocus } from '../actions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

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
