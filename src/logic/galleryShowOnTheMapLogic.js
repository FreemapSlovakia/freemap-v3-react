import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { mapRefocus } from 'fm3/actions/mapActions';

export default createLogic({
  type: at.GALLERY_SHOW_ON_THE_MAP,
  process({ getState }, dispatch, done) {
    const { image } = getState().gallery;
    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
    done();
  },
});
