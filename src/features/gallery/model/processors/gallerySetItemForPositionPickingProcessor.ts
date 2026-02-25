import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { gallerySetItemForPositionPicking } from '../actions.js';

export const gallerySetItemForPositionPickingProcessor: Processor = {
  actionCreator: gallerySetItemForPositionPicking,
  async handle({ getState, dispatch }) {
    const { pickingPosition } = getState().gallery;

    if (pickingPosition) {
      dispatch(
        mapRefocus({ lat: pickingPosition.lat, lon: pickingPosition.lon }),
      );
    }
  },
};
