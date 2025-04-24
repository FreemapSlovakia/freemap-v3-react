import { gallerySetItemForPositionPicking } from '../actions/galleryActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { Processor } from '../middlewares/processorMiddleware.js';

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
