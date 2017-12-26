import { createLogic } from 'redux-logic';

import { mapRefocus } from 'fm3/actions/mapActions';

export default createLogic({
  type: 'GALLERY_SHOW_ON_THE_MAP',
  process({ getState }, dispatch, done) {
    const { image } = getState().gallery;
    if (image) {
      dispatch(mapRefocus({ lat: image.lat, lon: image.lon }));
    }
    done();
  },
});
