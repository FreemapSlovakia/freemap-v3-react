import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { gallerySetItemForPositionPicking } from 'fm3/actions/galleryActions';

export const gallerySetItemForPositionPickingProcessor: Processor = {
  actionCreator: gallerySetItemForPositionPicking,
  handle: async ({ getState, dispatch }) => {
    const { pickingPosition } = getState().gallery;
    if (pickingPosition) {
      dispatch(
        mapRefocus({ lat: pickingPosition.lat, lon: pickingPosition.lon }),
      );
    }
  },
};
