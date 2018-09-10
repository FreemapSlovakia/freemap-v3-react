import axios from 'axios';
import { createLogic } from 'redux-logic';
import { lineString } from '@turf/helpers';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { toNodes, toWays } from 'fm3/logic/osmUtils.js';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.OSM_LOAD_WAY,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(
      `//api.openstreetmap.org/api/0.6/way/${getState().trackViewer.osmWayId}/full`,
      {
        responseType: 'document',
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        const ways = toWays(data, toNodes(data));

        dispatch(trackViewerSetData({
          trackGeojson: {
            type: 'FeatureCollection',
            features: Object.keys(ways).map(id => lineString(ways[id])),
          },
          startPoints: [],
          finishPoints: [],
        }));
      })
      .catch((err) => {
        dispatch(toastsAddError('osm.fetchingError', err));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
