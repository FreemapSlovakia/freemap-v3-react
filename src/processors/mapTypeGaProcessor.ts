import { enableUpdatingUrl } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

let prevMapType: string | undefined;

let prevOverlays: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, enableUpdatingUrl /* any initial action */],
  handle: async ({ getState }) => {
    const {
      map: { mapType, overlays },
    } = getState();

    if (prevMapType !== mapType) {
      window._paq.push(['trackEvent', 'Map', 'setMapType', mapType]);

      prevMapType = mapType;
    }

    const joinedOverlays = [...overlays].sort().join(',');

    if ([...prevOverlays].sort().join(',') !== joinedOverlays) {
      window._paq.push(['trackEvent', 'Map', 'setOverlays', joinedOverlays]);

      prevOverlays = overlays;
    }
  },
};
