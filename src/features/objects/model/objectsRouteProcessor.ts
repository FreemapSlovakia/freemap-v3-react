import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { metersPerPixel } from '@shared/geoutils.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  objectsRouteClear,
  objectsRouteRequest,
  objectsRouteSet,
} from './actions.js';
import { fetchProminenceRoute } from './terrainFacts.js';

export const objectsRouteProcessor: Processor<typeof objectsRouteRequest> = {
  actionCreator: objectsRouteRequest,
  handle: async ({ action, dispatch, getState, toastError }) => {
    const { osmId } = action.payload;

    const { lat, zoom } = getState().map;

    // About a pixel on the screen it was asked from, so the line keeps to the
    // ridges at the zoom it is looked at without carrying a major summit's
    // tens of thousands of points.
    const simplifyM = Math.max(5, Math.round(metersPerPixel(zoom, lat)));

    let coordinates;

    try {
      coordinates = await fetchProminenceRoute(osmId, simplifyM, getState, {
        stateChangePredicate: (state) => state.objects.route?.osmId,
      });
    } catch (err) {
      if (getState().objects.route?.osmId === osmId) {
        dispatch(objectsRouteClear());
      }

      await toastError(err, loadObjectsMessages, 'routeFetchError');

      return;
    }

    if (getState().objects.route?.osmId !== osmId) {
      return;
    }

    dispatch(objectsRouteSet({ osmId, coordinates }));
  },
};
