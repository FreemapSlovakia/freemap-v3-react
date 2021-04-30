import { gallerySetItemForPositionPicking } from 'fm3/actions/galleryActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
