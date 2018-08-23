import axios from 'axios';
import React from 'react';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { mapDetailsSetTrackInfoPoints } from 'fm3/actions/mapDetailsActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import RoadDetails from 'fm3/components/RoadDetails';

export default createLogic({
  type: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
  cancelType: [at.SET_TOOL, at.CLEAR_MAP],
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    let way;
    let bbox;
    const state = getState();
    const { subtool, userSelectedLat, userSelectedLon } = state.mapDetails;
    if (subtool === 'track-info') {
      const pid = Math.random();
      dispatch(startProgress(pid));

      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      bbox = [userSelectedLat - 0.0004, userSelectedLon - 0.0005, userSelectedLat + 0.0004, userSelectedLon + 0.0005];
      const body = `[out:json][bbox:${bbox.join(',')}];way['highway'];out 1 geom meta;`; // definitely the worst query language syntax ever
      axios.post('//overpass-api.de/api/interpreter', body, {
        validateStatus: status => status === 200,
        cancelToken: source.token,
      })
        .then(({ data }) => {
          if (data.elements && data.elements.length === 1) {
            [way] = data.elements;
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              message: <RoadDetails way={way} bbox={bbox} />,
              cancelType: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
              style: 'info',
            }));
            dispatch(mapDetailsSetTrackInfoPoints(way.geometry));
          } else {
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              messageKey: 'mapDetails.notFound',
              cancelType: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
              timeout: 5000,
              style: 'info',
            }));
            dispatch(mapDetailsSetTrackInfoPoints(null));
          }
        })
        .catch((err) => {
          dispatch(toastsAddError('mapDetails.fetchingError', err));
        })
        .then(() => {
          storeDispatch(stopProgress(pid));
          done();
        });
    } else {
      done();
    }
  },
});
