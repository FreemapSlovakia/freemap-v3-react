import React from 'react';
import { createLogic } from 'redux-logic';

import { toastsAdd } from 'fm3/actions/toastsActions';
import { galleryLayerHint } from 'fm3/actions/galleryActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

export default createLogic({
  type: 'SET_TOOL',
  process({ getState }, dispatch, done) {
    if (getState().main.tool === 'gallery' && !getState().map.overlays.includes('I') && !localStorage.getItem('galleryPreventLayerHint')) {
      dispatch(toastsAdd({
        collapseKey: 'gallery.showLayerHint',
        message: (
          <span>
            Pre zapnutie vrstvy s fotografiami zvoľte <FontAwesomeIcon icon="picture-o" /> <i>Fotografie</i>
            {' z '}<FontAwesomeIcon icon="map-o" /> ponuky vrstiev (klávesa <kbd>f</kbd>).
          </span>
        ),
        style: 'info',
        actions: [
          { name: 'OK' },
          { name: 'Už viac nezobrazovať', action: galleryLayerHint() },
        ],
      }));
    }
    done();
  },
});
