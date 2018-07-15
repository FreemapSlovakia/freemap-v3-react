import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';
import storage from 'fm3/storage';

export default createLogic({
  type: at.GALLERY_PREVENT_LAYER_HINT,
  process(_, dispatch, done) {
    storage.setItem('galleryPreventLayerHint', '1');
    done();
  },
});
