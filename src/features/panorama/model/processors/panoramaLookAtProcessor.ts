import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { groundPoint, readTowards } from '../../ray.js';
import {
  panoramaLookAt,
  panoramaSetAzimuth,
  panoramaSetProbe,
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

    const { azimuth, seen } = readTowards(render, action.payload);

    dispatch(panoramaSetAzimuth(azimuth));

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
