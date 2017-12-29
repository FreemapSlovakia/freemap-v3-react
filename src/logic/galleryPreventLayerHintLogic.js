import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.GALLERY_PREVENT_LAYER_HINT,
  process(_, dispatch, done) {
    localStorage.setItem('galleryPreventLayerHint', '1');
    done();
  },
});
