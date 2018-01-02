import React from 'react';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { toastsAdd } from 'fm3/actions/toastsActions';
import TrackViewerDetails from 'fm3/components/TrackViewerDetails';

export default createLogic({
  type: at.TRACK_VIEWER_SHOW_INFO,
  process(_, dispatch, done) {
    dispatch(toastsAdd({
      collapseKey: 'trackViewer.trackInfo',
      message: <TrackViewerDetails />,
      cancelType: [at.CLEAR_MAP, at.TRACK_VIEWER_SET_TRACK_DATA],
      style: 'info',
    }));

    done();
  },
});
