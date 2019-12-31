import { toastsAdd } from 'fm3/actions/toastsActions';
import { galleryPreventLayerHint } from 'fm3/actions/galleryActions';
import { storage } from 'fm3/storage';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { selectFeature } from 'fm3/actions/mainActions';

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
          collapseKey: 'gallery.showLayerHint',
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
