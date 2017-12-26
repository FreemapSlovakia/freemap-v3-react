import { createLogic } from 'redux-logic';

export default createLogic({
  type: 'GALLERY_PREVENT_LAYER_HINT',
  process(_, dispatch, done) {
    localStorage.setItem('galleryPreventLayerHint', '1');
    done();
  },
});
