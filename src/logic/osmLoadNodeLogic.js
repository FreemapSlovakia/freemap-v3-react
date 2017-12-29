import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { toNodes } from 'fm3/logic/osmUtils.js';

export default createLogic({
  type: at.OSM_LOAD_NODE,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(
      `//api.openstreetmap.org/api/0.6/node/${getState().trackViewer.osmNodeId}`,
      {
        responseType: 'document',
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        const nodes = toNodes(data);

        dispatch(trackViewerSetData({
          trackGeojson: {
            type: 'FeatureCollection',
            features: Object.keys(nodes).map(id => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: nodes[id],
              },
            })),
          },
          startPoints: [],
          finishPoints: [],
        }));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri získavaní OSM dát: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
