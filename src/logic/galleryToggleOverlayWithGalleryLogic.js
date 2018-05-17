import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { mapRefocus } from 'fm3/actions/mapActions';
import { galleryHideGalleryOverlayOnToolLeave } from 'fm3/actions/galleryActions';

export default createLogic({
  type: at.SET_TOOL,
  process({ getState }, dispatch, done) {
    const { overlays } = getState().map;
    if (getState().main.tool === 'gallery') {
      if (!overlays.includes('I')) {
        const overlaysWithPhotos = [...overlays];
        overlaysWithPhotos.push('I');
        dispatch(mapRefocus({ overlays: overlaysWithPhotos }));
        dispatch(galleryHideGalleryOverlayOnToolLeave(true));
      }
    } else if (getState().gallery.hideGalleryOverlayOnToolLeave) {
      const overlaysWithoutPhotos = overlays.filter(o => o !== 'I');
      dispatch(mapRefocus({ overlays: overlaysWithoutPhotos }));
      dispatch(galleryHideGalleryOverlayOnToolLeave(false));
    }
    done();
  },
});
