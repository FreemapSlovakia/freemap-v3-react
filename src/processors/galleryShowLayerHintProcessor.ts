import { galleryPreventLayerHint } from 'fm3/actions/galleryActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { storage } from 'fm3/storage';

export const galleryShowLayerHintProcessor: Processor = {
  actionCreator: selectFeature,
  handle: async ({ getState, dispatch }) => {
    if (
      getState().main.selection?.type === 'photos' &&
      !getState().map.overlays.includes('I') &&
      !storage.getItem('galleryPreventLayerHint')
    ) {
      dispatch(
        toastsAdd({
          id: 'gallery.showLayerHint',
          messageKey: 'gallery.layerHint',
          style: 'info',
          actions: [
            { nameKey: 'general.ok' },
            {
              nameKey: 'general.preventShowingAgain',
              action: galleryPreventLayerHint(),
            },
          ],
        }),
      );
    }
  },
};
