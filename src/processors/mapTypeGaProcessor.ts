import { enableUpdatingUrl } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

let prevMapType: string | undefined;
let prevOverlays: string[] = [];

export const mapTypeGaProcessor: Processor = {
  actionCreator: [mapRefocus, enableUpdatingUrl /* any initial action */],
  handle: async ({ getState }) => {
    const {
      map: { mapType, overlays },
    } = getState();

    if (prevMapType !== mapType) {
      window.ga('set', 'dimension1', mapType);

      window.ga('send', 'event', 'Map', 'setMapType', mapType);

      prevMapType = mapType;
    }

    if ([...prevOverlays].sort().join(',') !== [...overlays].sort().join(',')) {
      window.ga('send', 'event', 'Map', 'setOverlays', overlays);

      prevOverlays = overlays;
    }
  },
};
