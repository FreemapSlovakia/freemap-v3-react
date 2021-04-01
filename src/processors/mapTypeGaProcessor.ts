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
      window.gtag('set', {
        mapType: 'mapType',
      });

      window.gtag('event', 'setMapType', {
        event_category: 'Map',
        value: mapType,
      });

      prevMapType = mapType;
    }

    if ([...prevOverlays].sort().join(',') !== [...overlays].sort().join(',')) {
      window.gtag('event', 'setOverlays', {
        event_category: 'Map',
        value: overlays,
      });

      prevOverlays = overlays;
    }
  },
};
