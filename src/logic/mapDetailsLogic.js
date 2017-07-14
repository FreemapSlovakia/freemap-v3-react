import { createLogic } from 'redux-logic';
import { mapDetailsSetTrackInfoPoints } from 'fm3/actions/mapDetailsActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

export default createLogic({
  type: 'MAP_DETAILS_SET_USER_SELECTED_POSITION',
  process({ getState, cancelled$ }, dispatch, done) {
    const state = getState();
    const { subtool, userSelectedLat, userSelectedLon } = state.mapDetails;
    if (subtool === 'track-info') {
      const pid = Math.random();
      dispatch(startProgress(pid));
      cancelled$.subscribe(() => {
        dispatch(stopProgress(pid));
      });

      const bbox = [userSelectedLat - 0.0001, userSelectedLon - 0.0005, userSelectedLat + 0.0001, userSelectedLon + 0.0005];
      const body = `[out:json][bbox:${bbox.join(',')}];way['highway'];out geom;`; // definitely the worst query language syntax ever
      fetch('http://overpass-api.de/api/interpreter', { method: 'POST', body })
        .then(res => res.json())
        .then((payload) => {
          if (payload.elements && payload.elements.length > 0) {
            const way = payload.elements[0];
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              message: JSON.stringify(way.tags),
              cancelType: ['SET_TOOL', 'MAP_DETAILS_SET_USER_SELECTED_POSITION'],
              style: 'info',
            }));
            dispatch(mapDetailsSetTrackInfoPoints(way.geometry));
          } else {
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              message: 'Nebola nájdená žiadna cesta',
              cancelType: ['SET_TOOL', 'MAP_DETAILS_SET_USER_SELECTED_POSITION'],
              timeout: 3000,
              style: 'info',
            }));
          }
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nastala chyba pri získavaní detailov o ceste: ${e}`));
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    } else {
      done();
    }
  },
});
