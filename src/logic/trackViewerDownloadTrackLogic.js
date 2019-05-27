import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { getAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACK_VIEWER_DOWNLOAD_TRACK,
  process({ getState }, dispatch, done) {
    const { trackUID } = getState().trackViewer;
    getAxios()
      .get(`/tracklogs/${trackUID}`)
      .then(({ data }) => {
        if (data.error) {
          dispatch(
            toastsAddError('trackViewer.fetchingError', {
              message: data.error,
            }),
          );
        } else {
          const trackGpx = atob(data.data);
          dispatch(trackViewerSetData({ trackGpx }));
        }
      })
      .catch(err => {
        dispatch(toastsAddError('trackViewer.fetchingError', err));
      })
      .then(() => {
        done();
      });
  },
});
