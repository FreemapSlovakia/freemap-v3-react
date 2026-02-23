import { gallerySetItemForPositionPicking } from '../actions.js';
import { mapRefocus } from '../../../map/model/actions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

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
