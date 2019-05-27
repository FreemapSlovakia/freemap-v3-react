import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { getAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACK_VIEWER_GPX_LOAD,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    getAxios()
      .get(getState().trackViewer.gpxUrl)
      .then(({ data }) => {
        dispatch(trackViewerSetData({ trackGpx: data }));
      })
      .catch(err => {
        dispatch(toastsAddError('trackViewer.fetchingError', err));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
