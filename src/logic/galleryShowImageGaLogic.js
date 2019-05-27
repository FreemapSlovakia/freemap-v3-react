import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.GALLERY_SET_IMAGE,
  process({ getState }, dispatch, done) {
    const {
      gallery: { image },
    } = getState();
    if (image) {
      window.ga('send', 'event', 'Gallery', 'showPhoto', image.id);
    }
    done();
  },
});
