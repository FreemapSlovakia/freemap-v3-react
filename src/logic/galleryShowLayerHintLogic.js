import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { galleryLayerHint } from 'fm3/actions/galleryActions';
import storage from 'fm3/storage';

export default createLogic({
  type: at.SET_TOOL,
  process({ getState }, dispatch, done) {
    if (
      getState().main.tool === 'gallery' &&
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
              action: galleryLayerHint(),
            },
          ],
        }),
      );
    }
    done();
  },
});
