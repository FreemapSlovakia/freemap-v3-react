import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetTrackUID } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: 'TRACK_VIEWER_UPLOAD_TRACK',
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const { trackGpx } = getState().trackViewer;
    if (trackGpx.length > (process.env.MAX_GPX_TRACK_SIZE_IN_MB * 1000000)) {
      dispatch(toastsAddError(`Veľkosť nahraného súboru prevyšuje ${process.env.MAX_GPX_TRACK_SIZE_IN_MB} MB. Zdieľanie podporujeme len pre menšie súbory.`));
      done();
      return;
    }

    const pid = Math.random();
    dispatch(startProgress(pid));
    const source = axios.CancelToken.source();
    cancelled$.subscribe(() => {
      source.cancel();
    });

    axios.post(`${process.env.API_URL}/tracklogs`, {
      data: btoa(unescape(encodeURIComponent(trackGpx))),
      mediaType: 'application/gpx+xml',
    }, {
      validateStatus: status => status === 201,
      cancelToken: source.token,
    })
      .then(({ data }) => {
        dispatch(trackViewerSetTrackUID(data.uid));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nepodarilo sa nahrať súbor: ${e.message}`));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
