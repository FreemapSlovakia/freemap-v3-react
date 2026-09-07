import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { groundPoint, readTowards, withinRender } from '../../ray.js';
import {
  panoramaLookAt,
  panoramaRender,
  panoramaSetAzimuth,
  panoramaSetProbe,
  panoramaSetRenderAz,
  panoramaSetSettings,
} from '../actions.js';

/**
 * Turns the view to a place named on the map, and marks it — the same mark a
 * press in the picture leaves, taken the other way round. Here rather than in
 * the reducer: the distance buffer that answers whether the place can be seen
 * at all is `renderHolder`'s, and a reducer may not read it. The bearing is
 * taken here too, so that one reading answers both rather than two readings
 * having to agree.
 */
export const panoramaLookAtProcessor: Processor<typeof panoramaLookAt> = {
  actionCreator: panoramaLookAt,
  id: 'panoramaLookAt',
  handle: async ({ getState, dispatch, action }) => {
    const { render } = getState().panorama;

    if (!render) {
      return;
    }

    // Naming a place is aiming, and a view turning by itself — or following the
    // compass — would take that bearing away the moment it is set, the same as
    // it would during a drag in the picture.
    if (getState().panoramaSettings.autoPan) {
      dispatch(panoramaSetSettings({ autoPan: false }));
    }

    const { azimuth, distance, seen } = readTowards(render, action.payload);

    dispatch(panoramaSetAzimuth(azimuth));

    // A place the slice does not reach: naming one is the explicit act a render
    // needs, so the strip is swung round to it and paid for. The mark carries
    // no row — there is no picture it belongs to yet — which is also what keeps
    // it across the render that follows; the viewer finds its row on arrival.
    if (!withinRender(render, azimuth)) {
      dispatch(panoramaSetProbe({ ...action.payload, distance, azimuth }));

      dispatch(panoramaSetRenderAz(azimuth));

      dispatch(panoramaRender());

      return;
    }

    // No mark where the picture has nothing to answer with — sky the whole way
    // down that column, or a render whose distance buffer never arrived. A
    // press in the picture is silent in the same case, for the same reason.
    dispatch(
      panoramaSetProbe(
        seen && {
          ...groundPoint(render.viewpoint, azimuth, seen.distance),
          distance: seen.distance,
          azimuth,
          iy: seen.iy,
          ele: seen.ele,
        },
      ),
    );
  },
};
