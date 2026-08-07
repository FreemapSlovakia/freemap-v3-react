import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '../../hooks/leafletElementHolder.js';
import { duringProgrammaticMove } from '../../moveOrigin.js';
import { mapRefocus } from '../actions.js';

export const mapRefocusProcessor: Processor = {
  handle: async ({ dispatch, getState, prevState }) => {
    const prevMap = prevState.map;

    const { zoom, lat, lon } = getState().map;

    if (prevMap.lat === lat && prevMap.lon === lon && prevMap.zoom === zoom) {
      return;
    }

    const map = await mapPromise;

    // The map may have been unmounted (its container detached, panes removed)
    // while this async handler was pending; touching it would throw on the
    // missing _mapPane.
    if (!map.getContainer().isConnected) {
      return;
    }

    let fixedLon = lon;

    while (fixedLon < -180) {
      fixedLon += 360;
    }

    while (fixedLon > 180) {
      fixedLon -= 360;
    }

    if (
      map.getZoom() !== zoom ||
      map.getCenter().lat !== lat ||
      map.getCenter().lng !== fixedLon
    ) {
      const fixing = lon !== fixedLon;

      // Only the wrap fix names an animation, to suppress one: it would spin
      // the map the long way around the world to arrive where it already is.
      // Everywhere else Leaflet decides, and it declines for anything more than
      // a screen away — a jump to a searched place or a loaded track lands at
      // once instead of sliding the whole map pane across the continent.
      duringProgrammaticMove(() =>
        map.setView(
          [lat, fixedLon],
          zoom,
          fixing ? { animate: false } : undefined,
        ),
      );

      if (fixing) {
        dispatch(mapRefocus({ lon: fixedLon }));
      }
    }
  },
};
